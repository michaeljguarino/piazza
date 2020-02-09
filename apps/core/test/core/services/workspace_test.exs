defmodule Core.Services.WorkspaceTest do
  use Core.DataCase, async: true
  alias Core.Services.{Workspaces, Conversations}

  describe "create" do
    test "Admins can create new workspaces" do
      admin = insert(:user, roles: %{admin: true})
      {:ok, workspace} = Workspaces.create(%{name: "general"}, admin)

      assert workspace.name == "general"
      conv = Conversations.get_conversation_by_name!("general")
      assert conv.workspace_id == workspace.id
    end

    test "non admins cannot create" do
      {:error, _} = Workspaces.create(%{name: "general"}, insert(:user))
    end
  end
end