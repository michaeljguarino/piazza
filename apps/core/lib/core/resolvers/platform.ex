defmodule Core.Resolvers.Platform do
  use Core.Resolvers.Base, model: Core.Models.Command
  alias Core.Services.Platform
  alias Core.Models.{Webhook, IncomingWebhook, InstallableCommand}

  def query(Command, _args), do: Command
  def query(Webhook, _args), do: Webhook
  def query(IncomingWebhook, _args), do: IncomingWebhook

  def list_commands(args, _) do
    Command.any()
    |> Command.ordered()
    |> paginate(args)
  end

  def list_installable_commands(args, _) do
    InstallableCommand.uninstalled()
    |> InstallableCommand.ordered()
    |> paginate(args)
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