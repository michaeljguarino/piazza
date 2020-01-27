defmodule Core.Exporter.TokenTest do
  use Core.DataCase, async: true
  alias Core.Exporter.Token

  describe "invertible" do
    test "Tokens can be signed and validated" do
      {:ok, token, _} = Token.generate_and_sign(%{"export_type" => "json"})
      {:ok, %{"export_type" => "json"}} = Token.verify_and_validate(token)
    end
  end
end