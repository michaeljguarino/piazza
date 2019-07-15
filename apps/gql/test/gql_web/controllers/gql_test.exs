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
      |> json_response(401)
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
  end
end