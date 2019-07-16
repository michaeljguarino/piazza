defmodule Core.Resolvers.User do
  use Core.Resolvers.Base, model: Core.Models.User
  alias Core.Services.Users

  def query(_, %{id: id}), do: User.for_id(id)
  def query(_, _), do: User

  def resolve_user(_parent, %{id: id}, _res), do: {:ok, Users.get_user(id)}
  def resolve_user(_parent, %{email: email}, _res), do: {:ok, Users.get_user_by_email(email)}
  def resolve_user(_parent, %{handle: handle}, _res), do: {:ok, Users.get_user_by_handle(handle)}

  def list_users(args, _) do
    User.ordered()
    |> paginate(args)
  end

  def create_user(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Users.create_user(attrs, user)

  def update_user(%{id: id, attributes: attrs}, %{context: %{current_user: user}}),
    do: Users.update_user(id, attrs, user)

  def delete_user(%{id: id}, %{context: %{current_user: user}}),
    do: Users.delete_user(id, user)
end