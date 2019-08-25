defmodule Core.Services.Platform do
  use Core.Services.Base
  alias Core.PubSub
  alias Core.Services.Conversations
  alias Core.Models.{
    User,
    Webhook,
    IncomingWebhook,
    Command
  }

  import Core.Policies.Platform

  def get_command(name), do: Core.Repo.get_by(Command, name: name)

  def get_command!(name), do: Core.Repo.get_by!(Command, name: name)

  def get_incoming_webhook!(secure_id),
    do: Core.Repo.get_by!(IncomingWebhook, secure_id: secure_id)

  def get_incoming_webhook(secure_id),
    do: Core.Repo.get_by(IncomingWebhook, secure_id: secure_id)

  def create_command(%{webhook: webhook_args, name: name} = args, user) do
    start_transaction()
    |> add_operation(:bot, fn _ ->
      bot_args = Map.get(args, :bot, %{})
      %User{bot: true}
      |> User.changeset(inflated_bot_args(bot_args, name))
      |> Core.Repo.insert()
    end)
    |> add_operation(:webhook, fn _ ->
      %Webhook{}
      |> Webhook.changeset(webhook_args)
      |> Core.Repo.insert()
    end)
    |> add_operation(:command, fn %{bot: bot, webhook: webhook} ->
      %Command{webhook_id: webhook.id, bot_id: bot.id, creator_id: user.id}
      |> Command.changeset(args)
      |> allow(user, :create)
      |> when_ok(:insert)
    end)
    |> maybe_add_incoming_webhook(args, user)
    |> execute(extract: :command)
    |> notify(:create, user)
  end

  defp maybe_add_incoming_webhook(transaction, %{incoming_webhook: incoming_webhook_args}, user) do
    add_operation(transaction, :incoming_webhook, fn %{command: command} ->
      create_incoming_webhook(incoming_webhook_args, command, user)
    end)
  end
  defp maybe_add_incoming_webhook(transaction, _, _), do: transaction

  def create_incoming_webhook(%{name: name}, %Command{id: command_id, bot_id: bot_id} = command, user) do
    conversation = Conversations.get_conversation_by_name!(name)

    with {:ok, _} <- Core.Policies.Conversation.allow(conversation, user, :update) do
      %IncomingWebhook{command_id: command_id, creator_id: user.id}
      |> IncomingWebhook.changeset(%{
        bot_id: bot_id,
        name: "#{command.name}-#{name}",
        conversation_id: conversation.id
      })
      |> Core.Repo.insert()
    end
  end

  def dispatch_incoming_webhook(msg, %IncomingWebhook{} = incoming_webhook) do
    %{bot: bot, conversation_id: conv_id} = Core.Repo.preload(incoming_webhook, [:bot])
    Core.Services.Conversations.create_message(conv_id, msg, bot)
  end
  def dispatch_incoming_webhook(msg, secure_id),
    do: dispatch_incoming_webhook(msg, get_incoming_webhook!(secure_id))

  def update_command(name, attrs, user) do
    get_command!(name)
    |> Command.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:update)
    |> notify(:update, user)
  end

  defp inflated_bot_args(args, name) do
    args
    |> Map.put_new(:name, name)
    |> Map.put_new(:handle, name)
    |> Map.put_new(:password, :crypto.strong_rand_bytes(64) |> Base.encode64())
    |> Map.put_new(:email, "#{name}+bot@piazzapp.com")
  end

  defp notify({:ok, %Command{} = c}, :create, actor),
    do: handle_notify(PubSub.CommandCreated, c, actor: actor)
  defp notify({:ok, %Command{} = c}, :update, actor),
    do: handle_notify(PubSub.CommandUpdated, c, actor: actor)

  defp notify(ignored, _, _), do: ignored
end