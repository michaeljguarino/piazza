defmodule Core.Services.UsersTest do
  use Core.DataCase, async: true
  alias Core.Services.Users
  alias Core.PubSub

  @pwd "super strong pwd"

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

  describe "#activate_user/2" do
    test "Admins can reactivate users" do
      admin = insert(:user, roles: %{admin: true})
      other_user = insert(:user, deleted_at: Timex.now())

      {:ok, deleted} = Users.activate_user(other_user.id, admin)

      refute deleted.deleted_at
    end

    test "Non admins cannot reactivate" do
      user = insert(:user)
      other_user = insert(:user, deleted_at: Timex.now())

      {:error, _} = Users.activate_user(other_user.id, user)

      assert refetch(other_user).deleted_at
    end
  end

  describe "update_user/2" do
    test "A user can update himself" do
      user = build(:user) |> with_password(@pwd)
      {:ok, updated} = Users.update_user(user.id, %{name: "New Name"}, user)

      assert updated.name == "New Name"
      assert_receive {:event, %PubSub.UserUpdated{item: ^updated}}
    end

    @tag :skip
    test "A user can add avatars" do
      user = build(:user) |> with_password(@pwd)
      url  = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/600px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg"
      {:ok, user} = Users.update_user(user.id, %{avatar: url}, user)

      assert Core.Avatar.url({user.avatar, user})
    end

    test "Admins can modify user roles" do
      admin = insert(:user, roles: %{admin: true})
      user = build(:user) |> with_password(@pwd)
      {:ok, updated} = Users.update_user(user.id, %{roles: %{admin: true}}, admin)

      assert updated.roles.admin
      assert_receive {:event, %PubSub.UserUpdated{item: ^updated}}
    end

    test "Non admins cannot modify roles" do
      nonadmin = insert(:user, roles: %{admin: false})
      user = build(:user) |> with_password(@pwd)
      {:error, _} = Users.update_user(user.id, %{roles: %{admin: true}}, nonadmin)
    end

    test "A user can't update someone else" do
      user = build(:user) |> with_password(@pwd)
      other_user = insert(:user)
      {:error, msg} = Users.update_user(user.id, %{name: "New Name"}, other_user)

      assert is_binary(msg)
    end
  end

  describe "#login/2" do
    test "A user can login with his password" do
      user = build(:user) |> with_password(@pwd)

      {:ok, login} = Users.login_user(user.email, @pwd)

      assert login.id == user.id
    end

    test "A deleted user cannot login" do
      user =
        build(:user, deleted_at: DateTime.utc_now())
        |> with_password(@pwd)

      {:error, :not_found} = Users.login_user(user.email, @pwd)
    end
  end

  describe "#create_reset_token/1" do
    test ":password tokens can be created" do
      user = insert(:user)

      {:ok, token} = Users.create_reset_token(%{email: user.email, type: :password})

      assert token.secure_id

      assert_receive {:event, %PubSub.PasswordReset{item: ^token}}
    end
  end

  describe "#apply_reset_token/2" do
    test ":password tokens can update passwords" do
      user  = insert(:user)
      token = insert(:reset_token, user: user)

      {:ok, user} = Users.apply_reset_token(token, %{password: @pwd})

      {:ok, _} = Users.login_user(user.email, @pwd)

      refute refetch(token)
    end
  end
end