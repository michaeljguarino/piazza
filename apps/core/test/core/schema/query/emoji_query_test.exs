defmodule Core.Schema.EmojiQueryTest do
  use Core.DataCase, async: true

  describe "emoji" do
    test "It will list emoji" do
      emoji = insert_list(3, :emoji)
      {:ok, %{data: %{"emoji" => found}}} = run_query("""
        query {
          emoji(first: 5) {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      """, %{}, %{current_user: insert(:user)})

      found = from_connection(found)
      assert ids_equal(found, emoji)
    end
  end
end