defmodule GraphQl.Resolvers.Workspace do
  use GraphQl.Resolvers.Base, model: Core.Models.Workspace
  alias Core.Models.Notification
  alias Core.Services.Workspaces

  def data(args) do
    Dataloader.Ecto.new(Core.Repo,
      query: &query/2,
      default_params: filter_context(args),
      run_batch: &run_batch/5
    )
  end

  def query(Workspace, _), do: Workspace

  def run_batch(_, _, :unread_notifications, [{%{id: user_id}, _} | _] = args, repo_opts) do
    wk_ids = Enum.map(args, fn {_, %{id: id}} -> id end)

    result =
      Notification.for_user(user_id)
      |> Notification.for_workspaces(wk_ids)
      |> Notification.unseen_count()
      |> Core.Repo.all(repo_opts)
      |> Map.new()

    Enum.map(wk_ids, & [Map.get(result, &1, 0)])
  end
  def run_batch(queryable, query, col, inputs, repo_opts) do
    Dataloader.Ecto.run_batch(Core.Repo, queryable, query, col, inputs, repo_opts)
  end

  def create_workspace(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Workspaces.create(attrs, user)

  def update_workspace(%{attributes: attrs, id: id}, %{context: %{current_user: user}}),
    do: Workspaces.update(attrs, id, user)

  def list_workspaces(args, %{context: %{current_user: user}}) do
    Workspace.for_user(user.id)
    |> Workspace.ordered()
    |> paginate(args)
  end
end