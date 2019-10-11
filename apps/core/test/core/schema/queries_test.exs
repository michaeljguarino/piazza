defmodule Core.Schema.QueriesTest do
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

  describe "pinnedMessages" do
    test "a participant can list pinned messages for a conversation" do
      user = insert(:user)
      conv = insert(:conversation, pinned_messages: 3)
      messages = insert_list(3, :pinned_message, conversation: conv) |> Enum.map(& &1.message)
      insert_list(3, :message, conversation: conv)
      insert(:participant, conversation: conv, user: user)

      {:ok, %{data: %{"conversation" => found}}} = run_query("""
          query Conversation($id: ID) {
            conversation(id: $id) {
              id
              pinnedMessageCount
              pinnedMessages(first: 5) {
                edges {
                  node {
                    message {
                      id
                      text
                      creator {
                        backgroundColor
                      }
                    }
                  }
                }
              }
            }
          }
      """, %{"id" => conv.id}, %{current_user: user})

      assert found["pinnedMessageCount"] == 3
      pinned = from_connection(found["pinnedMessages"])

      assert ids_equal(Enum.map(pinned, & &1["message"]), messages)
    end
  end

  describe "files" do
    test "a participant can list files for a conversation" do
      user = insert(:user)
      conv = insert(:conversation)
      files = for _ <- 1..3,
        do: insert(:file, message: build(:message, conversation: conv))

      {:ok, %{data: %{"conversation" => found}}} = run_query("""
          query Conversation($id: ID) {
            conversation(id: $id) {
              id
              fileCount
              files(first: 5) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
      """, %{"id" => conv.id}, %{current_user: user})

      assert found["fileCount"] == 3
      found_files = from_connection(found["files"])

      assert ids_equal(found_files, files)
    end
  end

  describe "Commands" do
    test "It will list available commands" do
      commands = insert_list(3, :command)
      expected = Enum.sort_by(commands, & &1.name) |> Enum.take(2)

      {:ok, %{data: %{"commands" => commands}}} = run_query("""
        query {
          commands(first: 2) {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      """, %{}, %{current_user: insert(:user)})

      commands = from_connection(commands)
      assert Enum.all?(commands, & &1["name"])
      assert ids_equal(commands, expected)
    end
  end

  describe "searchCommands" do
    test "It will search for commands by name" do
      commands = for i <- 1..3, do: insert(:command, name: "found-#{i}")
      ignore  = insert(:command)

      {:ok, %{data: %{"searchCommands" => found}}} = run_query("""
        query {
          searchCommands(name: "found", first: 4) {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      """, %{}, %{current_user: insert(:user)})

      found = from_connection(found) |> by_ids()

      for command <- commands, do: assert found[command.id]
      refute found[ignore.id]
    end
  end

  describe "notifications" do
    test "it will paginate notifications for a user" do
      user = insert(:user)
      now = Timex.now()
      notifications = for day <- 1..3,
        do: insert(:notification, user: user, inserted_at: Timex.shift(now, days: -day))

      insert_list(2, :notification)
      expected = Enum.take(notifications, 2)

      {:ok, %{data: %{"notifications" => notifications}}} = run_query("""
        query {
          notifications(first: 2) {
            edges {
              node {
                id
                message {
                  text
                }
              }
            }
          }
        }
      """, %{}, %{current_user: user})

      notifications = from_connection(notifications)
      assert Enum.all?(notifications, & &1["message"]["text"])
      assert ids_equal(notifications, expected)
    end
  end

  describe "emoji" do
    test "It will list emoji" do
      emoji = insert_list(3, :emoji)
      {:ok, %{data: %{"emoji" => found}}} = run_query("""
        query {
          emoji(first: 5) {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      """, %{}, %{current_user: insert(:user)})

      found = from_connection(found)
      assert ids_equal(found, emoji)
    end
  end

  describe "brand" do
    test "It will sideload the brand theme" do
      brand = insert(:brand)

      {:ok, %{data: %{"brand" => found}}} = run_query("""
        query {
          brand {
            theme {
              id
            }
          }
        }
      """, %{}, %{})

      assert found["theme"]["id"] == brand.theme_id
    end

    test "It will sideload the current user's theme" do
      insert(:brand)
      %{user: user, theme: theme} = insert(:user_theme)
      {:ok, %{data: %{"brand" => found}}} = run_query("""
        query {
          brand {
            theme {
              id
            }
          }
        }
      """, %{}, %{current_user: user})

      assert found["theme"]["id"] == theme.id
    end
  end

  describe "themes" do
    test "It will list the themes in the system" do
      themes = insert_list(3, :theme)

      {:ok, %{data: %{"themes" => found}}} = run_query("""
        query {
          themes(first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{}, %{current_user: insert(:user)})

      found_themes = from_connection(found)
      assert ids_equal(found_themes, themes)
    end
  end

  describe "#installableCommands" do
    test "It will list installable commands in the system" do
      [first | installables] = insert_list(3, :installable_command)
      insert(:command, name: first.name)

      {:ok, %{data: %{"installableCommands" => found}}} = run_query("""
        query {
          installableCommands(first: 5) {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      """, %{}, %{current_user: insert(:user)})

      found_installables = from_connection(found)
      assert ids_equal(installables, found_installables)
    end
  end
end