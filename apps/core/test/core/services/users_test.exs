defmodule Core.Services.UsersTest do
  use Core.DataCase, async: true
  alias Core.Services.Users
  alias Core.PubSub

  describe "create_user/1" do
    test "Admins can create a user" do
      {:ok, user} = Users.create_user(%{
        name: "new user",
        email: "some@email.com",
        handle: "n00b",
        password: "this should work"
      }, insert(:user, roles: %{admin: true}))

      assert user.id
      assert user.name == "new user"
      assert user.email == "some@email.com"
      assert user.handle == "n00b"
      assert user.password_hash && user.password_hash != "this should work"

      assert_receive {:event, %PubSub.UserCreated{item: ^user}}
    end

    test "Nonadmins cannot create users" do
      {:error, _} = Users.create_user(%{
        name: "new user",
        email: "some@email.com",
        handle: "n00b",
        password: "this should work"
      }, insert(:user))
    end
  end

  describe "#delete_user/2" do
    test "Admins can delete users" do
      admin = insert(:user, roles: %{admin: true})
      other_user = insert(:user)

      {:ok, deleted} = Users.delete_user(other_user.id, admin)

      assert deleted.deleted_at
    end

    test "Non admins cannot delete users" do
      user = insert(:user)
      other_user = insert(:user)

      {:error, _} = Users.delete_user(other_user.id, user)
    end
  end

  describe "update_user/2" do
    test "A user can update himself" do
      user = build(:user) |> with_password("super strong pwd")
      {:ok, updated} = Users.update_user(user.id, %{name: "New Name"}, user)

      assert updated.name == "New Name"
      assert_receive {:event, %PubSub.UserUpdated{item: ^updated}}
    end

    test "Admins can modify user roles" do
      admin = insert(:user, roles: %{admin: true})
      user = build(:user) |> with_password("super strong pwd")
      {:ok, updated} = Users.update_user(user.id, %{roles: %{admin: true}}, admin)

      assert updated.roles.admin
      assert_receive {:event, %PubSub.UserUpdated{item: ^updated}}
    end

    test "Non admins cannot modify roles" do
      nonadmin = insert(:user, roles: %{admin: false})
      user = build(:user) |> with_password("super strong pwd")
      {:error, _} = Users.update_user(user.id, %{roles: %{admin: true}}, nonadmin)
    end

    test "A user can't update someone else" do
      user = build(:user) |> with_password("super strong pwd")
      other_user = insert(:user)
      {:error, msg} = Users.update_user(user.id, %{name: "New Name"}, other_user)

      assert is_binary(msg)
    end
  end
end