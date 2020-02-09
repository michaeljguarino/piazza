defmodule GraphQl.WorkspaceQueryTest do
  use GraphQl.SchemaCase, async: true

  describe "workspaces" do
    test "It will list workspaces a user is a member of" do
      user = insert(:user)
      [first | _] = participants = insert_list(3, :participant, user: user)
      add_to_workspace(user, first.conversation.workspace)
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

    test "It can sideload notification counts" do
      user = insert(:user)
      [first, second] = insert_list(2, :workspace)
      Enum.each([first, second], &add_to_workspace(user, &1))
      insert_list(3, :notification, user: user, workspace: first)
      insert_list(2, :notification, user: user, workspace: second)

      {:ok, %{data: %{"workspaces" => found}}} = run_q("""
        query {
          workspaces(first: 5) {
            edges {
              node {
                id
                unreadNotifications
              }
            }
          }
        }
      """, %{}, %{current_user: user})

      by_id = from_connection(found) |> Enum.into(%{}, & {&1["id"], &1})
      assert by_id[first.id]["unreadNotifications"] == 3
      assert by_id[second.id]["unreadNotifications"] == 2
    end
  end

  def add_to_workspace(user, workspace) do
    insert(:participant,
      conversation: build(:conversation, workspace: workspace),
      user: user
    )
  end
end