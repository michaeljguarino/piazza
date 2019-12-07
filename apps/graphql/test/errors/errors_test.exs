defmodule GraphQl.ErrorsTest do
  use GraphQl.SchemaCase, async: true

  describe "Ecto.NoResultsError" do
    test "it'll properly format the exception" do
      {:ok, %{errors: [%{message: message}]}} = run_q("""
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            id
            email
            jwt
          }
        }
      """, %{"email" => "user@example.com", "password" => "really strong password"})

      assert message == "That record does not exist"
    end
  end
end