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

  describe "Conversation" do
    test "It will fetch a conversation" do
      conversation = insert(:conversation)
      insert(:conversation)
      user = insert(:user)


      {:ok, %{data: %{"conversation" => found}}} = run_query("""
          query Conversation($id: ID) {
            conversation(id: $id) {
              id
              name
            }
          }
      """, %{"id" => conversation.id}, %{current_user: user})

      assert found["id"] == conversation.id
      assert found["name"] == conversation.name
    end

    test "It will sideload messages and participants" do
      conversation = insert(:conversation)
      messages = insert_list(3, :message, conversation: conversation)
      participants = insert_list(2, :participant, conversation: conversation)
      ignored = insert(:conversation)
      insert_list(3, :message, conversation: ignored)
      insert_list(2, :participant, conversation: ignored)
      user = insert(:user)

      {:ok, %{data: %{"conversation" => found}}} = run_query("""
          query Conversation($participantCount: Int!, $messageCount: Int!, $id: ID) {
            conversation(id: $id) {
              id
              name
              messages(first: $messageCount) {
                edges {
                  node {
                    id
                    text
                    creator {
                      backgroundColor
                    }
                  }
                }
              }
              participants(first: $participantCount) {
                edges {
                  node {
                    id
                    user {
                      id
                      name
                    }
                  }
                }
              }
            }
          }
      """, %{"id" => conversation.id, "participantCount" => 3, "messageCount" => 3}, %{current_user: user})

      found_participants = from_connection(found["participants"])
      found_msgs = from_connection(found["messages"])

      assert found["id"] == conversation.id
      assert found["name"] == conversation.name
      assert ids_equal(found_msgs, messages)
      assert ids_equal(found_participants, participants)

      assert Enum.all?(found_participants, & &1["user"]["name"] && &1["user"]["id"])
    end
  end

  describe "Conversations" do
    test "It will list conversations you'are a participant of" do
      user = insert(:user)
      conversations = insert_list(3, :conversation)
      expected = Enum.sort_by(conversations, & &1.name) |> Enum.take(2)
      for conv <- expected,
        do: insert(:participant, user: user, conversation: conv)

      {:ok, %{data: %{"conversations" => found}}} = run_query("""
        query Conversations($conversationCount: Int!) {
          conversations(first: $conversationCount) {
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
      """, %{"conversationCount" => 2}, %{current_user: user})

      refute found["pageInfo"]["hasPreviousPage"]
      refute found["pageInfo"]["hasNextPage"]
      conversations = from_connection(found)

      assert Enum.all?(conversations, & &1["name"])
      assert ids_equal(conversations, expected)
    end

    test "It will sideload unread messages" do
      user = insert(:user)
      first = insert(:conversation)
      second = insert(:conversation)
      last_seen = Timex.now() |> Timex.shift(days: -2)
      before = Timex.shift(last_seen, days: -1)
      insert(:participant, conversation: first, user: user, last_seen_at: last_seen)
      insert(:participant, conversation: second, user: user)
      insert(:message, conversation: first, inserted_at: before)
      insert_list(2, :message, conversation: first)
      insert_list(3, :message, conversation: second)

      {:ok, %{data: %{"conversations" => found}}} = run_query("""
        query Conversations($conversationCount: Int!) {
          conversations(first: $conversationCount) {
            pageInfo {
              hasPreviousPage
              hasNextPage
            }
            edges {
              node {
                id
                name
                unreadMessages
              }
            }
          }
        }
      """, %{"conversationCount" => 2}, %{current_user: user})

      conversations = from_connection(found) |> by_ids()
      assert conversations[first.id]["unreadMessages"] == 2
      assert conversations[second.id]["unreadMessages"] == 3
    end

    test "It will sideload participant counts" do
      user = insert(:user)
      %{conversation: first} = insert(:participant, user: user)
      %{conversation: second} = insert(:participant, user: user)
      insert_list(2, :participant, conversation: first)

      {:ok, %{data: %{"conversations" => found}}} = run_query("""
        query Conversations($conversationCount: Int!) {
          conversations(first: $conversationCount) {
            pageInfo {
              hasPreviousPage
              hasNextPage
            }
            edges {
              node {
                id
                name
                participantCount
              }
            }
          }
        }
      """, %{"conversationCount" => 2}, %{current_user: user})

      conversations = from_connection(found) |> by_ids()
      assert conversations[first.id]["participantCount"] == 3
      assert conversations[second.id]["participantCount"] == 1
    end
  end

  describe "searchConversations" do
    test "A user can search accessible conversations" do
      user = insert(:user)
      public  = insert(:conversation, name: "conv1")
      ignored = insert(:conversation, name: "conv2", public: false)
      private = insert(:conversation, name: "conv3", public: false)
      miss    = insert(:conversation, name: "nomatch")
      insert(:participant, conversation: private, user: user)

      {:ok, %{data: %{"searchConversations" => found}}} = run_query("""
        query SearchConversations($name: String!, $conversationCount: Int!) {
          searchConversations(name: $name, first: $conversationCount) {
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
      """, %{"conversationCount" => 5, "name" => "conv"}, %{current_user: user})

      conversations = from_connection(found) |> by_ids()
      assert conversations[public.id]["name"]
      assert conversations[private.id]["name"]
      refute conversations[ignored.id]
      refute conversations[miss.id]
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

  describe "notifications" do
    test "it will paginate notifications for a user" do
      user = insert(:user)
      notifications = insert_list(3, :notification, user: user)
      insert_list(2, :notification)
      expected =
        Enum.sort_by(notifications, & &1.inserted_at)
        |> Enum.reverse()
        |> Enum.take(2)

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
end