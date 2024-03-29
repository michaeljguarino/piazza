defmodule GraphQl.Resolvers.Platform do
  use GraphQl.Resolvers.Base, model: Core.Models.Command
  alias Core.Services.Platform
  alias Core.Models.{Webhook, IncomingWebhook, Unfurler}

  def query(Command, _args), do: Command
  def query(Webhook, _args), do: Webhook
  def query(Unfurler, _args), do: Unfurler
  def query(IncomingWebhook, _args), do: IncomingWebhook

  def list_commands(args, _) do
    Command.any()
    |> Command.ordered()
    |> paginate(args)
  end

  def list_installable_commands(%{first: first} = args, _) do
    GraphQl.Proxy.Forge.list_integrations(first, args[:after])
  end

  def search_commands(%{name: name} = args, _) do
    Command.any()
    |> Command.search(name)
    |> paginate(args)
  end

  def create_command(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Platform.create_command(attrs, user)

  def update_command(%{name: name, attributes: attrs}, %{context: %{current_user: user}}),
    do: Platform.update_command(name, attrs, user)

  def dispatch_interaction(%{id: id, payload: payload}, _),
    do: Platform.dispatch_interaction(payload, id)
end