defmodule Core.Resolvers.User do
  use Core.Resolvers.Base, model: Core.Models.User

  def query(_, %{id: id}), do: User.for_id(id)
  def query(_, _), do: User.any()

  def resolve_user(_parent, %{id: id}, _res), do: {:ok, find_user(id)}

  def find_user(id), do: Core.Repo.get(User, id)

  def list_users(args, _) do
    User.ordered()
    |> paginate(args)
  end
end