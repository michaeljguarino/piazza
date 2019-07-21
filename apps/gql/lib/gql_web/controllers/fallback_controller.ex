defmodule GqlWeb.FallbackController do
  use Phoenix.Controller

  def call(conn, {:error, error}) do
    {error, msg} = error(error)

    conn
    |> put_status(error)
    |> json(%{message: msg})
  end

  def error(:invalid_password), do: {401, "Invalid Password"}
  def error(:not_found), do: {404, "Not Found"}
end