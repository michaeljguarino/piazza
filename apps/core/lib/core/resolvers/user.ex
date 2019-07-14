defmodule Core.Resolvers.User do
  use Core.Resolvers.Base, model: Core.Models.User
  alias Core.Services.Users

  def query(_, %{id: id}), do: User.for_id(id)
  def query(_, _), do: User

  def resolve_user(_parent, %{id: id}, _res), do: {:ok, find_user(id)}

  def find_user(id), do: Core.Repo.get(User, id)

  def list_users(args, _) do
    User.ordered()
    |> paginate(args)
  end

  def create_user(%{attributes: attrs}, _), do: Users.create_user(attrs)

  def update_user(%{id: id, attributes: attrs}, %{context: %{current_user: user}}),
    do: Users.update_user(id, attrs, user)
end