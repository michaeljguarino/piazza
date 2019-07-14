defmodule Core.Services.UsersTest do
  use Core.DataCase, async: true
  alias Core.Services.Users
  alias Core.PubSub

  describe "create_user/1" do
    test "It will create a user" do
      {:ok, user} = Users.create_user(%{
        name: "new user",
        email: "some@email.com",
        handle: "n00b",
        password: "this should work"
      })

      assert user.id
      assert user.name == "new user"
      assert user.email == "some@email.com"
      assert user.handle == "n00b"
      assert user.password_hash && user.password_hash != "this should work"

      assert_receive {:event, %PubSub.UserCreated{item: ^user}}
    end
  end

  describe "update_user/2" do
    test "A user can update himself" do
      user = build(:user) |> with_password("super strong pwd")
      {:ok, updated} = Users.update_user(user.id, %{name: "New Name"}, user)

      assert updated.name == "New Name"
      assert_receive {:event, %PubSub.UserUpdated{item: ^updated}}
    end

    test "A user can't update someone else" do
      user = build(:user) |> with_password("super strong pwd")
      other_user = insert(:user)
      {:error, msg} = Users.update_user(user.id, %{name: "New Name"}, other_user)

      assert is_binary(msg)
    end
  end
end