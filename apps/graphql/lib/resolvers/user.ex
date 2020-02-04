defmodule GraphQl.Resolvers.User do
  use GraphQl.Resolvers.Base, model: Core.Models.User
  alias Core.Services.Users

  def query(_, %{id: id}), do: User.for_id(id)
  def query(_, _), do: User

  def resolve_user(_parent, %{id: id}, _res), do: {:ok, Users.get_user(id)}
  def resolve_user(_parent, %{email: email}, _res), do: {:ok, Users.get_user_by_email(email)}
  def resolve_user(_parent, %{handle: handle}, _res), do: {:ok, Users.get_user_by_handle(handle)}

  def list_users(args, _) do
    User.ordered()
    |> maybe_include_inactive(args)
    |> paginate(args)
  end

  def search_users(%{name: name} = args, _) do
    User.search(name)
    |> maybe_include_inactive(args)
    |> paginate(args)
  end

  defp maybe_include_inactive(query, %{active: false}), do: query
  defp maybe_include_inactive(query, _), do: User.active(query)

  def create_user(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Users.create_user(attrs, user)

  def signup(%{attributes: attrs} = args, _) do
    Users.create_user(attrs)
    |> with_jwt()
    |> maybe_resolve_invite(args)
  end

  def update_user(%{id: id, attributes: attrs}, %{context: %{current_user: user}}),
    do: Users.update_user(id, attrs, user)

  def activate_user(%{id: id, active: true}, %{context: %{current_user: user}}),
    do: Users.activate_user(id, user)
  def activate_user(%{id: id}, %{context: %{current_user: user}}),
    do: Users.delete_user(id, user)

  def login_user(%{email: email, password: pwd} = args, _) do
    Users.login_user(email, pwd)
    |> with_jwt()
    |> maybe_resolve_invite(args)
  end

  def create_reset_token(args, _), do: Users.create_reset_token(args)

  def apply_reset_token(%{id: id, args: args}, _), do: Users.apply_reset_token(id, args)

  defp maybe_resolve_invite({:ok, user}, %{invite_token: token}) do
    with {:ok, _} <- Core.Services.Invites.realize_from_token(token, user),
      do: {:ok, user}
  end
  defp maybe_resolve_invite(result, _), do: result

  def with_jwt({:ok, user}) do
      with {:ok, token, _} <- Core.Guardian.encode_and_sign(user),
        do: {:ok, %{user | jwt: token}}
  end
  def with_jwt(error), do: error

  def token(type) do
    with {:ok,token, _} <- Core.Exporter.Token.generate_and_sign(%{"type" => type}),
      do: {:ok, token}
  end

  @colors ~w(#6b5b95 #feb236 #d64161 #ff7b25 #103A50 #CDCCC2 #FDC401 #8E5B3C #020001 #2F415B)

  def background_color(%{id: id}) do
    stripped = String.replace(id, "-", "")
    {integral, _} = Integer.parse(stripped, 16)
    Enum.at(@colors, rem(integral, length(@colors)))
  end
end