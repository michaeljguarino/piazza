defmodule Core.Schema.UserMutationsTest do
  use Core.DataCase, async: true
  alias Core.Models.User

  describe "createUser" do
    test "Admins can create a new user" do
      admin = insert(:user, roles: %{admin: true})
      {:ok, %{data: %{"createUser" => result}}} = run_query("""
        mutation  {
          createUser(attributes: {
            name: "New User",
            handle: "n00b",
            email: "some@email.com",
            password: "very strong password",
            bio: "Just a user"
          }) {
            id
            name
            email
            bio
          }
        }
      """, %{}, %{current_user: admin})

      verify_record(User, result)
    end
  end

  describe "updateUser" do
    test "A user can update himself" do
      user = build(:user) |> with_password("really strong password")
      {:ok, %{data: %{"updateUser" => result}}} = run_query("""
        mutation updateUser($id: ID!) {
          updateUser(id: $id, attributes: {
            name: "New User",
            handle: "n00b",
            bio: "Just a user"
          }) {
            id
            name
            email
            bio
          }
        }
      """, %{"id" => user.id}, %{current_user: user})

      assert result["id"] == user.id
      verify_record(User, result)
    end

    test "An admin can update roles" do
      user = build(:user) |> with_password("really strong password")
      admin = insert(:user, roles: %{admin: true})
      {:ok, %{data: %{"updateUser" => user}}} = run_query("""
        mutation updateUser($id: ID!) {
          updateUser(id: $id, attributes: {
            name: "New User",
            handle: "n00b",
            bio: "Just a user",
            roles: {admin: true}
          }) {
            id
            roles {
              admin
            }
          }
        }
      """, %{"id" => user.id}, %{current_user: admin})

      assert user["roles"]["admin"]
    end
  end

  describe "deleteUser" do
    test "An admin can delete users" do
      user = build(:user) |> with_password("really strong password")
      admin = insert(:user, roles: %{admin: true})
      {:ok, %{data: %{"deleteUser" => user}}} = run_query("""
        mutation deleteUser($id: ID!) {
          deleteUser(id: $id) {
            id
            deletedAt
          }
        }
      """, %{"id" => user.id}, %{current_user: admin})

      assert user["deletedAt"]
    end
  end

  describe "login" do
    test "You can login by email/password" do
      user = build(:user, email: "user@example.com") |> with_password("really strong password")
      {:ok, %{data: %{"login" => login}}} = run_query("""
        mutation {
          login(email: "user@example.com", password: "really strong password") {
            id
            email
            jwt
          }
        }
      """, %{})

      assert login["id"] == user.id
      assert is_binary(login["jwt"])
    end
  end

  describe "signup" do
    test "You can signup by email/password" do
      {:ok, %{data: %{"signup" => signup}}} = run_query("""
        mutation {
          signup(attributes: {
            email: "user@example.com",
            password: "really strong password",
            handle: "user",
            name: "Some User"
          }) {
            id
            email
            jwt
          }
        }
      """, %{})

      assert signup["id"]
      assert signup["email"] == "user@example.com"
      assert is_binary(signup["jwt"])
    end
  end
end