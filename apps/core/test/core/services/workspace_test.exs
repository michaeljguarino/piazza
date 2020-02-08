defmodule Core.Services.WorkspaceTest do
  use Core.DataCase, async: true
  alias Core.Services.Workspaces

  describe "create" do
    test "Admins can create new workspaces" do
      admin = insert(:user, roles: %{admin: true})
      {:ok, wkspace} = Workspaces.create(%{name: "general"}, admin)

      assert wkspace.name == "general"
    end

    test "non admins cannot create" do
      {:error, _} = Workspaces.create(%{name: "general"}, insert(:user))
    end
  end
end