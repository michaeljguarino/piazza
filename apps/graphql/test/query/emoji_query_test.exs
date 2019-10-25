defmodule GraphQl.EmojiQueryTest do
  use GraphQl.SchemaCase, async: true

  describe "emoji" do
    test "It will list emoji" do
      emoji = insert_list(3, :emoji)
      {:ok, %{data: %{"emoji" => found}}} = run_q("""
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