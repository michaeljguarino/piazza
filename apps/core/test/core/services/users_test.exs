defmodule Core.Services.UsersTest do
  use Core.DataCase, async: true
  alias Core.Services.Users

  describe "update_user/2" do
    test "A user can update himself" do
      user = build(:user) |> with_password("super strong pwd")
      {:ok, updated} = Users.update_user(user.id, %{name: "New Name"}, user)

      assert updated.name == "New Name"
    end

    test "A user can't update someone else" do
      user = build(:user) |> with_password("super strong pwd")
      other_user = insert(:user)
      {:error, msg} = Users.update_user(user.id, %{name: "New Name"}, other_user)

      assert is_binary(msg)
    end
  end
end