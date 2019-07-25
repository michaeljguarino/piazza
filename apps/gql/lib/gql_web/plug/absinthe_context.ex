defmodule GqlWeb.Plug.AbsintheContext do
  alias Core.Models.User
  def init(opts), do: opts

  def call(conn, _opts) do
    case Guardian.Plug.current_resource(conn) do
      %User{} = current_user -> Absinthe.Plug.put_options(conn, context: %{current_user: current_user})
      _ -> conn
    end
  end
end