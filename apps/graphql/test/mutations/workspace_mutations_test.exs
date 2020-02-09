defmodule GraphQl.WorkspaceMutationsTest do
  use GraphQl.SchemaCase, async: true

  describe "createWorkspace" do
    test "admins can create a workspace" do
      user = insert(:user, roles: %{admin: true})

      {:ok, %{data: %{"createWorkspace" => workspace}}} = run_q("""
          mutation CreateWorkspace($attrs: WorkspaceAttributes!) {
            createWorkspace(attributes: $attrs) {
              id
              name
              description
            }
          }
        """,
        %{"attrs" => %{"name" => "random", "description" => "a description"}},
        %{current_user: user}
      )

      assert workspace["id"]
      assert workspace["name"] == "random"
      assert workspace["description"] == "a description"
    end
  end

  describe "updateWorkspace" do
    test "Admins can update a workspace" do
      admin = insert(:user, roles: %{admin: true})
      workspace = insert(:workspace)

      {:ok, %{data: %{"updateWorkspace" => updated}}} = run_q("""
        mutation UpdateWorkspace($id: ID!, $description: String) {
          updateWorkspace(id: $id, attributes: {description: $description}) {
            id
            description
          }
        }
      """, %{"id" => workspace.id, "description" => "description"}, %{current_user: admin})

      assert updated["description"] == "description"
    end
  end
end