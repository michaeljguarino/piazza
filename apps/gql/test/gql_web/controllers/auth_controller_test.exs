defmodule GqlWeb.AuthControllerTest do
  use GqlWeb.ConnCase, async: true

  describe "#login/2" do
    test "It will 200 if the password is correct", %{conn: conn} do
      user = build(:user, email: "some@email.com") |> with_password("very strong password")
      path = Routes.auth_path(conn, :login)

      conn
      |> post(path, %{"email" => user.email, "password" => "very strong password"})
      |> json_response(200)
    end

    test "It will 401 if the password is incorrect", %{conn: conn} do
      user = build(:user, email: "some@email.com") |> with_password("very strong password")
      path = Routes.auth_path(conn, :login)

      conn
      |> post(path, %{"email" => user.email, "password" => "incorrect password"})
      |> json_response(401)
    end
  end
end