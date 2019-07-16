defmodule GqlWeb.AuthController do
  use GqlWeb, :controller
  alias Core.Services.Users

  def login(conn, %{"password" => pwd, "email" => email}) do
    with {:ok, user} <- Users.login_user(email, pwd),
         {:ok, token, _} <- Gql.Guardian.encode_and_sign(user) do
      conn
      |> put_resp_header("authorization", "Bearer #{token}")
      |> json(%{success: true})
    end
  end
end