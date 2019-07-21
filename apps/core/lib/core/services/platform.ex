defmodule Core.Services.Platform do
  use Core.Services.Base
  alias Core.PubSub
  alias Core.Models.{
    User,
    Webhook,
    IncomingWebhook,
    Command
  }

  import Core.Policies.Platform

  def get_command(name), do: Core.Repo.get_by(Command, name: name)

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
    |> execute(extract: :command)
    |> notify(:create, user)
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

  defp notify(ignored, _, _), do: ignored
end