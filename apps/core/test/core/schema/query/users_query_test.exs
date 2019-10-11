defmodule Core.Schema.UsersQueryTest do
  use Core.DataCase, async: true

  describe "User" do
    test "It will fetch a user by id" do
      user  = insert(:user)
      other = insert(:user)


      {:ok, %{data: %{"user" => found}}} = run_query("""
          query User($id: ID) {
            user(id: $id) {
              id
              name
              backgroundColor
            }
          }
      """, %{"id" => user.id}, %{current_user: other})

      assert found["id"] == user.id
      assert found["name"] == user.name
      assert found["backgroundColor"]
    end
  end

  describe "Users" do
    test "It will list users in the system" do
      users = insert_list(3, :user)
      expected = Enum.sort_by(users, & &1.name) |> Enum.take(2)

      {:ok, %{data: %{"users" => found}}} = run_query("""
        query Users($userCount: Int!) {
          users(first: $userCount) {
            pageInfo {
              hasPreviousPage
              hasNextPage
            }
            edges {
              node {
                id
                name
              }
            }
          }
        }
      """, %{"userCount" => 2}, %{current_user: insert(:user)})

      refute found["pageInfo"]["hasPreviousPage"]
      assert found["pageInfo"]["hasNextPage"]

      assert Enum.all?(found["edges"], & &1["node"]["name"])
      assert ids_equal(Enum.map(found["edges"], & &1["node"]), expected)
    end
  end

  describe "searchUsers" do
    test "It will search users by handle" do
      users = for i <- 1..3, do: insert(:user, handle: "found-#{i}")
      ignored = insert(:user, handle: "ignored")

      {:ok, %{data: %{"searchUsers" => found}}} = run_query("""
        query Users($name: String!, $userCount: Int!) {
          searchUsers(name: $name, first: $userCount) {
            edges {
              node {
                id
                handle
              }
            }
          }
        }
      """, %{"userCount" => 4, "name" => "found"}, %{current_user: insert(:user)})

      found_users = from_connection(found) |> by_ids()

      for user <- users,
        do: assert found_users[user.id]
      refute found_users[ignored.id]
    end
  end
end