defmodule GraphQl.WorkspaceQueryTest do
  use GraphQl.SchemaCase, async: true

  describe "workspaces" do
    test "It will list workspaces a user is a member of" do
      user = insert(:user)
      [first | _] = participants = insert_list(3, :participant, user: user)
      insert(:participant,
        conversation: build(:conversation, workspace: first.conversation.workspace),
        user: user
      )
      insert(:workspace)
      expected = Enum.map(participants, & &1.conversation.workspace)

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

      assert length(found["edges"]) == 3
      assert from_connection(found)
             |> ids_equal(expected)
    end
  end
end