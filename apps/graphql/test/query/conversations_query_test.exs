defmodule GraphQl.ConversationQueryTest do
  use GraphQl.SchemaCase, async: true

  describe "Conversation" do
    test "It will fetch a conversation" do
      conversation = insert(:conversation)
      insert(:conversation)
      user = insert(:user)


      {:ok, %{data: %{"conversation" => found}}} = run_q("""
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


      {:ok, %{data: %{"conversation" => found}}} = run_q("""
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

      {:ok, %{data: %{"conversation" => found}}} = run_q("""
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
        do: insert(:message, flattened_text: "query #{i}", conversation: conversation)
      insert_list(3, :message, conversation: conversation)
      %{user: user} = insert(:participant, conversation: conversation)

      {:ok, %{data: %{"conversation" => found}}} = run_q("""
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

      {:ok, %{data: %{"conversation" => found}}} = run_q("""
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


  describe "Conversations" do
    test "It will list conversations you'are a participant of" do
      user = insert(:user)
      conversations = insert_list(3, :conversation)
      expected = Enum.sort_by(conversations, & &1.name) |> Enum.take(2)
      for conv <- expected,
        do: insert(:participant, user: user, conversation: conv)

      {:ok, %{data: %{"conversations" => found}}} = run_q("""
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

    test "It can filter by workspace if specified" do
      user = insert(:user)
      workspace = insert(:workspace)
      conversations = insert_list(3, :conversation, workspace: workspace)
      expected = Enum.sort_by(conversations, & &1.name) |> Enum.take(2)
      for conv <- expected,
        do: insert(:participant, user: user, conversation: conv)
      insert_list(2, :participant, user: user)

      {:ok, %{data: %{"conversations" => found}}} = run_q("""
        query Conversations($id: ID) {
          conversations(workspaceId: $id, first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{"id" => workspace.id}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(expected)
    end

    test "It will list only public conversations if specified" do
      user = insert(:user)
      expected = insert_list(3, :conversation)
      insert(:conversation, public: false)

      {:ok, %{data: %{"conversations" => found}}} = run_q("""
        query Conversations($conversationCount: Int!) {
          conversations(first: $conversationCount, public: true) {
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
      """, %{"conversationCount" => 6}, %{current_user: user})

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

      {:ok, %{data: %{"conversations" => found}}} = run_q("""
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

      {:ok, %{data: %{"conversations" => found}}} = run_q("""
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

      {:ok, %{data: %{"conversations" => found}}} = run_q("""
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
      insert(:participant,
        conversation: build(:conversation, chat: true),
        user: user,
        deleted_at: DateTime.utc_now()
      )

      {:ok, %{data: %{"chats" => found}}} = run_q("""
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
      user    = insert(:user)
      public  = insert(:conversation, name: "conv1")
      ignored = insert(:conversation, name: "conv2", public: false)
      private = insert(:conversation, name: "conv3", public: false)
      miss    = insert(:conversation, name: "nomatch")
      insert(:participant, conversation: private, user: user)

      {:ok, %{data: %{"searchConversations" => found}}} = run_q("""
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

    test "It can filter by workspace" do
      user      = insert(:user)
      workspace = insert(:workspace)
      first     = insert(:conversation, name: "conv1", workspace: workspace)
      second    = insert(:conversation, name: "conv2", workspace: workspace)
      insert(:conversation, name: "conv3")

      {:ok, %{data: %{"searchConversations" => found}}} = run_q("""
        query Search($id: ID) {
          searchConversations(workspaceId: $id, name: "conv", first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{"id" => workspace.id}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal([first, second])
    end
  end
end