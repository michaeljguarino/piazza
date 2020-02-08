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
end