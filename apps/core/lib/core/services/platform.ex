defmodule Core.Services.Platform do
  use Core.Services.Base
  use Nebulex.Caching.Decorators
  alias Core.PubSub
  alias Core.Services.Conversations
  alias Core.Models.{
    User,
    Webhook,
    IncomingWebhook,
    Command,
    WebhookRoute,
    InstallableCommand,
    Message,
    Interaction,
    Unfurler
  }
  import Core.Policies.Platform

  @type command_resp :: {:ok, Command.t} | error
  @type incoming_webhook_resp :: {:ok, IncomingWebhook.t} | error

  @spec get_command(binary) :: Command.t
  def get_command(name), do: Core.Repo.get_by(Command, name: name)

  @spec get_command!(binary) :: Command.t
  def get_command!(name), do: Core.Repo.get_by!(Command, name: name)

  @spec get_incoming_webhook!(binary) :: IncomingWebhook.t
  def get_incoming_webhook!(secure_id),
    do: Core.Repo.get_by!(IncomingWebhook, secure_id: secure_id)

  @spec get_incoming_webhook(binary) :: IncomingWebhook.t | nil
  def get_incoming_webhook(secure_id),
    do: Core.Repo.get_by(IncomingWebhook, secure_id: secure_id)

  @spec get_unfurlers() :: [Unfurler.t]
  @decorate cache(cache: Core.Cache.Replicated, key: :unfurlers)
  def get_unfurlers() do
    Unfurler
    |> Core.Repo.all()
    |> Core.Repo.preload([command: :webhook])
    |> Enum.map(&Unfurler.compile/1)
  end

  @doc """
  Creates a new command in this instance, including an associated webhook,
  bot user, and optional incoming webhook

  qllowed roles:
  * all
  """
  @spec create_command(map, User.t) :: command_resp
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

  @doc """
  Updates attributes on a command and all secondary records

  allowed roles:
  * admin
  """
  @spec update_command(binary, map, User.t) :: command_resp
  def update_command(name, args, user) do
    start_transaction()
    |> add_operation(:command, fn _ ->
      Core.Repo.get_by!(Command, name: name)
      |> Core.Repo.preload([:unfurlers])
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

  @doc """
  Creates a new installable command stub record.

  Should really only be used in migrations
  """
  @spec create_installable_command(map) :: {:ok, InstallableCommand.t} | error
  def create_installable_command(attrs) do
    %InstallableCommand{}
    |> InstallableCommand.changeset(attrs)
    |> Core.Repo.insert()
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

  @doc """
  Creates an incoming webhook for a command

  allowed roles:
  * admin
  """
  @spec create_incoming_webhook(map, Command.t, User.t) :: incoming_webhook_resp
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

  @doc """
  Same as create_incoming_webhook, but an upsert
  """
  @spec upsert_incoming_webhook(nil | IncomingWebhook.t, map, Command.t, User.t) :: incoming_webhook_resp
  def upsert_incoming_webhook(nil, args, command, user), do: create_incoming_webhook(args, command, user)
  def upsert_incoming_webhook(%IncomingWebhook{} = incoming, args, _, user) do
    incoming
    |> IncomingWebhook.changeset(Map.put(args, :conversation_id, resolve_conversation_id(args, incoming)))
    |> allow(user, :edit)
    |> when_ok(:update)
  end

  defp resolve_conversation_id(%{name: name}, _), do: Conversations.get_conversation_by_name!(name).id
  defp resolve_conversation_id(_, %IncomingWebhook{conversation_id: id}), do: id

  @doc """
  Handles the body of an incoming webhook request. If `"route_key"` is specified at the top level,
  will look up in the incoming webhooks routing table to select the appropriate conversation for the
  post.
  """
  @spec dispatch_incoming_webhook(map, IncomingWebhook.t) :: Core.Services.Conversations.msg_resp | error
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

  @doc """
  Creates a route for directing payloads to incoming webhooks, see `dispatch_incoming_webhook/2`
  for more.
  """
  @spec upsert_webhook_route(binary, binary, Command.t) :: {:ok, WebhookRoute.t} | error
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

  @doc """
  If the interaction exists, hydrates it and dispatches it with the given payload
  """
  @spec dispatch_interaction(binary, binary) :: {:ok, Interaction.t}
  def dispatch_interaction(payload, interaction_id) do
    Core.Repo.get!(Interaction, interaction_id)
    |> Core.Repo.preload([:message, [command: [:webhook, :bot]]])
    |> Map.put(:payload, payload)
    |> notify(:dispatch)
  end

  @doc """
  Creates a new interaction against a webhook, message pair which can be used
  to validate callbacks in dialogs/etc
  """
  @spec create_interaction(Command.t, Message.t) :: {:ok, Interaction.t} | error
  def create_interaction(%Command{id: cid}, %Message{id: mid}) do
    %Interaction{command_id: cid, message_id: mid}
    |> Interaction.changeset()
    |> Core.Repo.insert()
  end

  defp inflated_bot_args(args, name) do
    args
    |> Map.put_new(:name, name)
    |> Map.put_new(:handle, name)
    |> Map.put_new(:password, :crypto.strong_rand_bytes(64) |> Base.url_encode64())
    |> Map.put_new(:email, "#{name}+bot@piazzapp.com")
  end

  defp notify(%Interaction{} = interaction, :dispatch),
    do: handle_notify(PubSub.InteractionDispatched, interaction)

  defp notify({:ok, %Command{} = c}, :create, actor),
    do: handle_notify(PubSub.CommandCreated, c, actor: actor)
  defp notify({:ok, %Command{} = c}, :update, actor),
    do: handle_notify(PubSub.CommandUpdated, c, actor: actor)

  defp notify(ignored, _, _), do: ignored
end