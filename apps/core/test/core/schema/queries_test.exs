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

    test "It will sideload your current participant" do
      conversation = insert(:conversation)
      user = insert(:user)
      part = insert(:participant, conversation: conversation, user: user)
      insert(:participant, conversation: conversation)


      {:ok, %{data: %{"conversation" => found}}} = run_query("""
          query Conversation($id: ID) {
            conversation(id: $id) {
              id
              name
              currentParticipant {
                id
              }
            }
          }
      """, %{"id" => conversation.id}, %{current_user: user})

      assert found["id"] == conversation.id
      assert found["name"] == conversation.name
      assert found["currentParticipant"]["id"] == part.id
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

    test "It will search messages" do
      conversation = insert(:conversation)
      messages = for i <- 1..3,
        do: insert(:message, text: "query #{i}", conversation: conversation)
      insert_list(3, :message, conversation: conversation)
      %{user: user} = insert(:participant, conversation: conversation)

      {:ok, %{data: %{"conversation" => found}}} = run_query("""
        query SearchMessages($id: ID!, $query: String) {
          conversation(id: $id) {
            id
            searchMessages(query: $query, first: 10) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      """, %{"id" => conversation.id, "query" => "query"}, %{current_user: user})

      assert found["id"] == conversation.id
      found_messages = from_connection(found["searchMessages"])

      assert ids_equal(found_messages, messages)
    end

    test "It will fetch messages by anchor" do
      anchor = DateTime.utc_now()
      conversation = insert(:conversation)
      before = for i <- 1..3,
        do: insert(:message, conversation: conversation, inserted_at: Timex.shift(anchor, days: -i))
      aftr = for i <- 1..3,
        do: insert(:message, conversation: conversation, inserted_at: Timex.shift(anchor, days: i))
      %{user: user} = insert(:participant, conversation: conversation)

      {:ok, %{data: %{"conversation" => found}}} = run_query("""
        query AnchoredMessages($id: ID!, $anchor: DateTime) {
          conversation(id: $id) {
            before: messages(first: 10, anchor: $anchor, direction: BEFORE) {
              edges {
                node {
                  id
                }
              }
            }
            after: messages(first: 10, anchor: $anchor, direction: AFTER) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      """, %{"id" => conversation.id, "anchor" => DateTime.to_iso8601(anchor)}, %{current_user: user})

      found_before = from_connection(found["before"])
      assert ids_equal(found_before, before)

      found_after = from_connection(found["after"])
      assert ids_equal(found_after, aftr)
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

    test "It will sideload unread notifications" do
      user = insert(:user)
      %{conversation: first} = insert(:participant, user: user)
      %{conversation: second} = insert(:participant, user: user)
      insert_list(2, :notification, user: user, message: insert(:message, conversation: first))
      insert_list(3, :notification, user: user, message: insert(:message, conversation: second))
      insert_list(2, :notification, message: insert(:message, conversation: first), seen_at: DateTime.utc_now())

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
                unreadNotifications
              }
            }
          }
        }
      """, %{"conversationCount" => 2}, %{current_user: user})

      conversations = from_connection(found) |> by_ids()
      assert conversations[first.id]["unreadNotifications"] == 2
      assert conversations[second.id]["unreadNotifications"] == 3
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

    test "It will filter on chat and sideload chat participants" do
      user = insert(:user)
      %{conversation: first} = insert(:participant, user: user)
      insert_list(2, :participant, conversation: first)

      chat   = insert(:conversation, chat: true, public: false)
      part   = insert(:participant, conversation: chat, user: user)
      others = insert_list(2, :participant, conversation: chat)

      {:ok, %{data: %{"chats" => found}}} = run_query("""
        query Chats($conversationCount: Int!) {
          chats(first: $conversationCount) {
            pageInfo {
              hasPreviousPage
              hasNextPage
            }
            edges {
              node {
                id
                name
                chatParticipants {
                  id
                }
              }
            }
          }
        }
      """, %{"conversationCount" => 3}, %{current_user: user})

      conversations = from_connection(found) |> by_ids()
      refute conversations[first.id]
      assert ids_equal(conversations[chat.id]["chatParticipants"], [part | others])
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
end