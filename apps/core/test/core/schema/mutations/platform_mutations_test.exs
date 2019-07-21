defmodule Core.Schema.PlatformMutationsTest do
  use Core.DataCase, async: true

  describe "createCommand" do
    test "A user can create a new command" do
      user = insert(:user)

      {:ok, %{data: %{"createCommand" => command}}} = run_query("""
        mutation {
          createCommand(attributes: {
            name: "giphy",
            documentation: "Sends you gifs",
            webhook: {url: "https://api.giphy.com"}
          }) {
            name
            documentation
            webhook {
              url
            }
            creator {
              name
            }
            bot {
              email
            }
          }
        }
      """, %{}, %{current_user: user})

      assert command["name"] == "giphy"
      assert command["documentation"] == "Sends you gifs"
      assert command["webhook"]["url"] == "https://api.giphy.com"
      assert command["creator"]["name"]
      assert command["bot"]["email"]
    end
  end
end