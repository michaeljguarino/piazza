defmodule GqlWeb.Plug.AbsintheContext do
  def init(opts), do: opts

  def call(conn, _opts) do
    current_user = Guardian.Plug.current_resource(conn)
    Absinthe.Plug.put_options(conn, context: %{current_user: current_user})
  end
end