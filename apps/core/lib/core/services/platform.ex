defmodule Core.Services.Platform do
  use Core.Services.Base
  alias Core.PubSub
  alias Core.Services.Conversations
  alias Core.Models.{
    User,
    Webhook,
    IncomingWebhook,
    Command,
    WebhookRoute,
  }

  alias Core.Commands.Github
  import Core.Commands.Base, only: [command_record: 4]

  import Core.Policies.Platform

  def get_command(name), do: Core.Repo.get_by(Command, name: name)

  def get_command!(name), do: Core.Repo.get_by!(Command, name: name)

  def get_incoming_webhook!(secure_id),
    do: Core.Repo.get_by!(IncomingWebhook, secure_id: secure_id)

  def get_incoming_webhook(secure_id),
    do: Core.Repo.get_by(IncomingWebhook, secure_id: secure_id)
  
  def built_in() do
    [
      command_record(
        Github, 
        "Notifies you of things going on in your repos",
        "http://piazza-gql:4000/webhooks/github",
        "https://storage.googleapis.com/piazzaapp-uploads/uploads/avatars/06c16162-db11-408f-a8e1-1cff537ca99c/github_transparent.png"
      )
    ]
  end

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

  def update_command(name, args, user) do
    start_transaction()
    |> add_operation(:command, fn _ ->
      Core.Repo.get_by!(Command, name: name)
      |> Command.changeset(args)
      |> allow(user, :update)
      |> when_ok(:update)
      |> when_ok(&Core.Repo.preload(&1, [:webhook, :bot, :incoming_webhook]))
    end)
    |> add_operation(:bot, fn %{command: %{bot: bot}} ->
      bot
      |> User.changeset(Map.get(args, :bot, %{}))
      |> Core.Repo.update()
    end)
    |> add_operation(:webhook, fn %{command: %{webhook: webhook}} ->
      webhook
      |> Webhook.changeset(Map.get(args, :webhook, %{}))
      |> Core.Repo.update()
    end)
    |> maybe_update_incoming_webhook(args, user)
    |> execute(extract: :command)
    |> notify(:update, user)
  end

  defp maybe_add_incoming_webhook(transaction, %{incoming_webhook: %{name: _} = incoming_webhook_args}, user) do
    add_operation(transaction, :incoming_webhook, fn %{command: command} ->
      create_incoming_webhook(incoming_webhook_args, command, user)
    end)
  end
  defp maybe_add_incoming_webhook(transaction, _, _), do: transaction

  defp maybe_update_incoming_webhook(transaction, %{incoming_webhook: incoming_webhook_args}, user) do
    add_operation(transaction, :incoming_webhook, fn %{command: %{incoming_webhook: incoming} = command} ->
      upsert_incoming_webhook(incoming, incoming_webhook_args, command, user)
    end)
  end
  defp maybe_update_incoming_webhook(transaction, _, _), do: transaction

  def create_incoming_webhook(%{name: name} = args, %Command{id: command_id, bot_id: bot_id} = command, user) do
    %IncomingWebhook{command_id: command_id, creator_id: user.id}
    |> IncomingWebhook.changeset(%{
      bot_id: bot_id,
      name: "#{command.name}-#{name}",
      conversation_id: resolve_conversation_id(args, nil)
    })
    |> allow(user, :edit)
    |> when_ok(:insert)
  end

  def upsert_incoming_webhook(nil, args, command, user), do: create_incoming_webhook(args, command, user)
  def upsert_incoming_webhook(%IncomingWebhook{} = incoming, args, _, user) do
    incoming
    |> IncomingWebhook.changeset(Map.put(args, :conversation_id, resolve_conversation_id(args, incoming)))
    |> allow(user, :edit)
    |> when_ok(:update)
  end

  defp resolve_conversation_id(%{name: name}, _), do: Conversations.get_conversation_by_name!(name).id
  defp resolve_conversation_id(_, %IncomingWebhook{conversation_id: id}), do: id

  def dispatch_incoming_webhook(%{"route_key" => route_key} = msg, %IncomingWebhook{} = incoming_webhook) do
    %{bot: bot, conversation_id: conv_id} = Core.Repo.preload(incoming_webhook, [:bot])
    case Core.Repo.get_by(WebhookRoute, incoming_webhook_id: incoming_webhook.id, route_key: route_key) do
      %WebhookRoute{conversation_id: conv_id} -> Core.Services.Conversations.create_message(conv_id, msg, bot)
      _ -> Core.Services.Conversations.create_message(conv_id, msg, bot)
    end
  end
  def dispatch_incoming_webhook(msg, %IncomingWebhook{} = incoming_webhook) do
    %{bot: bot, conversation_id: conv_id} = Core.Repo.preload(incoming_webhook, [:bot])
    Core.Services.Conversations.create_message(conv_id, msg, bot)
  end
  def dispatch_incoming_webhook(msg, secure_id),
    do: dispatch_incoming_webhook(msg, get_incoming_webhook!(secure_id))

  def upsert_webhook_route(route_key, conv_id, %Command{} = command) do
    with %{incoming_webhook: %{id: id}} <- Core.Repo.preload(command, [:incoming_webhook]) do
      case Core.Repo.get_by(WebhookRoute, route_key: route_key, incoming_webhook_id: id) do
        %WebhookRoute{} = route -> route
        _ -> %WebhookRoute{}
      end
      |> WebhookRoute.changeset(%{
        route_key: route_key,
        conversation_id: conv_id,
        incoming_webhook_id: id
      })
      |> Core.Repo.insert_or_update()
    else
      _ -> {:error, :not_found}
    end
  end

  defp inflated_bot_args(args, name) do
    args
    |> Map.put_new(:name, name)
    |> Map.put_new(:handle, name)
    |> Map.put_new(:password, :crypto.strong_rand_bytes(64) |> Base.url_encode64())
    |> Map.put_new(:email, "#{name}+bot@piazzapp.com")
  end

  defp notify({:ok, %Command{} = c}, :create, actor),
    do: handle_notify(PubSub.CommandCreated, c, actor: actor)
  defp notify({:ok, %Command{} = c}, :update, actor),
    do: handle_notify(PubSub.CommandUpdated, c, actor: actor)

  defp notify(ignored, _, _), do: ignored
end