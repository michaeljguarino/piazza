defmodule Core.Schema.UserMutationsTest do
  use Core.DataCase, async: true
  alias Core.Models.User

  describe "createUser" do
    test "It will create a new user" do
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
      """, %{})

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

    test "A user cannot update others" do
      user = build(:user) |> with_password("really strong password")
      other_user = insert(:user)
      {:ok, %{data: %{"updateUser" => nil}, errors: [%{message: _}]}} = run_query("""
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
      """, %{"id" => user.id}, %{current_user: other_user})
    end
  end
end