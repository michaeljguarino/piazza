defmodule Core.Services.Workspaces do
  use Core.Services.Base
  import Nebulex.Caching
  import Core.Policies.Workspace, only: [allow: 3]
  alias Core.Models.{Workspace}

  @type workspace_resp :: {:ok, Workspace.t} | {:error, term}

  @spec get!(binary) :: Workspace.t
  def get!(id), do: Core.Repo.get!(Workspace, id)

  @doc """
  Fetches a workspace by name (with read-through caching)
  """
  @spec get_by_name!(binary) :: Workspace.t
  defcacheable get_by_name!(name), cache: Core.Cache, key: {Workspace, name} do
    Core.Repo.get_by!(Workspace, name: name)
  end

  @doc """
  Fetches the configured default workspace
  """
  @spec default() :: Workspace.t
  def default() do
    Workspace.default()
    |> get_by_name!()
  end

  @doc """
  Fetches the default workspace id or if not found, materializes it and returns
  the result
  """
  @spec default_id() :: binary
  def default_id() do
    case Core.Repo.get_by(Workspace, name: Workspace.default()) do
      %{id: id} -> id
      _ -> create_if_none_present()
    end
  end

  defp create_if_none_present() do
    Workspace.first()
    |> Core.Repo.one()
    |> case do
      %{id: id} -> id
      _ ->
        {:ok, %{id: id}} = create_default()
        id
    end
  end

  @doc """
  Creates a new workspace. User must be an admin
  """
  @spec create(map, User.t) :: workspace_resp
  def create(args, user) do
    start_transaction()
    |> add_operation(:workspace, fn _ ->
      %Workspace{}
      |> Workspace.changeset(args)
      |> allow(user, :create)
      |> when_ok(:insert)
    end)
    |> add_operation(:conversation, fn %{workspace: %{id: wk_id, name: name}} ->
      Core.Services.Conversations.create_conversation(%{
        name: name,
        public: true,
        workspace_id: wk_id
      }, user)
    end)
    |> execute(extract: :workspace)
  end

  @doc """
  Updates a workspace
  """
  @spec update(map, binary, User.t) :: workspace_resp
  def update(args, id, user) do
    get!(id)
    |> Workspace.changeset(args)
    |> allow(user, :update)
    |> when_ok(:update)
  end

  @doc """
  Creates the default workspace
  """
  @spec create_default() :: workspace_resp
  def create_default() do
    %Workspace{}
    |> Workspace.changeset(%{name: Workspace.default()})
    |> Core.Repo.insert()
  end
end