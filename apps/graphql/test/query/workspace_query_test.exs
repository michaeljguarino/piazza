defmodule GraphQl.WorkspaceQueryTest do
  use GraphQl.SchemaCase, async: true

  describe "workspaces" do
    test "It will list workspaces a user is a member of" do
      user = insert(:user)
      expected =
        insert_list(3, :participant, user: user)
        |> Enum.map(& &1.conversation.workspace_id)
      insert(:workspace)

      {:ok, %{data: %{"workspaces" => found}}} = run_q("""
        query {
          workspaces(first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(expected)
    end
  end
end