defmodule GqlWeb.GqlTest do
  use GqlWeb.ConnCase, async: true

  describe "queries" do
    test "will respect authorization", %{conn: conn} do
      user = insert(:user)
      conversations = insert_list(3, :conversation)

      %{"data" => %{"conversations" => edges}} =
        conn
        |> authorized(user)
        |> post("/gql", wrap_gql(
          """
          query {
            conversations(public: true, first: 3) {
              edges {
                node {
                  id
                  name
                }
              }
            }
          }
          """
        ))
        |> json_response(200)

      found = from_connection(edges)
      assert ids_equal(found, conversations)
      assert Enum.all?(found, & &1["name"])
    end

    test "unauthorized users cannot query", %{conn: conn} do
      %{"errors" => errors} =
        conn
        |> post("/gql", wrap_gql(
          """
          query {
            conversations(public: true, first: 3) {
              edges {
                node {
                  id
                  name
                }
              }
            }
          }
          """
        ))
        |> json_response(200)

      refute Enum.empty?(errors)
    end
  end

  describe "mutations" do
    test "mutations respect authorization", %{conn: conn} do
      user = insert(:user)
      %{"data" => %{"createConversation" => conversation}} =
        conn
        |> authorized(user)
        |> post("/gql", wrap_gql(
          """
          mutation {
            createConversation(attributes: {public: true, name: "general"}) {
              id
              name
              creator {
                id
                name
              }
            }
          }
          """
        ))
        |> json_response(200)

      assert conversation["id"]
      assert conversation["name"]
      assert conversation["creator"]["id"]
      assert conversation["creator"]["name"]
    end

    test "Allows unauthed endpoints", %{conn: conn} do
      build(:user, email: "user@example.com")
      |> with_password("strongpassword")

      %{"data" => %{"login" => user}} =
        conn
        |> post("/gql", wrap_gql(
          """
          mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
              jwt
            }
          }
          """,
          %{"email" => "user@example.com", "password" => "strongpassword"}
        ))
        |> json_response(200)

      assert user["jwt"]
    end
  end
end