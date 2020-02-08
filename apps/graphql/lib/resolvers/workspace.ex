defmodule GraphQl.Resolvers.Workspace do
  use GraphQl.Resolvers.Base, model: Core.Models.Workspace
  alias Core.Services.Workspaces

  def query(Workspace, _), do: Workspace

  def create_workspace(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Workspaces.create(attrs, user)

  def list_workspaces(args, %{context: %{current_user: user}}) do
    Workspace.for_user(user.id)
    |> Workspace.ordered()
    |> paginate(args)
  end
end