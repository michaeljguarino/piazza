defmodule GraphQl.ConversationMutationsTest do
  use GraphQl.SchemaCase, async: true
  alias Core.Models.{Conversation, Message}

  describe "createConveration" do
    test "It will create a new conversation" do
      user = insert(:user)

      params = %{"name" => "new_conversation", "public" => false}
      {:ok, %{data: %{"createConversation" => result}}} = run_q("""
        mutation createConversation($attributes: ConversationAttributes!) {
          createConversation(attributes: $attributes) {
            id
            name
            public
          }
        }
      """, %{"attributes" => params}, %{current_user: user})

      assert submap?(params, result)
      verify_record(Conversation, result)
    end
  end

  describe "createChat" do
    test "it will create a private chat be" do
      user  = insert(:user)
      other = insert(:user)

      params = %{"userId" => other.id}
      {:ok, %{data: %{"createChat" => result}}} = run_q("""
        mutation CreateChat($userId: ID!) {
          createChat(userId: $userId) {
            id
            name
            public
          }
        }
      """, params, %{current_user: user})

      assert result["id"]
      assert result["name"] == Core.Services.Conversations.chat_name([user, other])
      refute result["public"]
    end
  end

  describe "updateConversation" do
    test "it will update a conversation by id" do
      user         = insert(:user)
      conversation = insert(:conversation)
      insert(:participant, conversation: conversation, user: user)

      params = %{"name" => "new conversation", "public" => false}
      {:ok, %{data: %{"updateConversation" => result}}} = run_q("""
        mutation  UpdateConversation($id: ID!, $attrs : ConversationAttributes!) {
          updateConversation(id: $id, attributes: $attrs) {
            id
            name
            public
          }
        }
      """, %{"id" => conversation.id, "attrs" => params}, %{current_user: user})

      assert submap?(params, result)
      verify_record(Conversation, result)
    end
  end

  describe "deleteConversation" do
    test "it will update a conversation by id" do
      user         = insert(:user)
      conversation = insert(:conversation)
      insert(:participant, conversation: conversation, user: user)

      {:ok, %{data: %{"deleteConversation" => result}}} = run_q("""
        mutation DeleteConversation($id: ID!) {
          deleteConversation(id: $id) {
            id
            name
            public
          }
        }
      """, %{"id" => conversation.id}, %{current_user: user})

      assert result["name"]
      refute refetch(conversation)
    end
  end

  describe "createMessage" do
    test "it will create a new message" do
      user         = insert(:user)
      conversation = insert(:conversation)
      insert(:participant, conversation: conversation, user: user)

      params = %{"text" => "my message"}
      {:ok, %{data: %{"createMessage" => result}}} = run_q("""
        mutation  CreateMessage($id: ID!, $attrs : MessageAttributes!) {
          createMessage(conversationId: $id, attributes: $attrs) {
            id
            text
          }
        }
      """, %{"id" => conversation.id, "attrs" => params}, %{current_user: user})

      assert submap?(params, result)
      verify_record(Message, result)
    end
  end

  describe "editMessage" do
    test "it will update a message by id" do
      msg = insert(:message)

      {:ok, %{data: %{"editMessage" => result}}} = run_q("""
        mutation EditMessage($id: ID!, $attrs: MessageAttributes!) {
          editMessage(messageId: $id, attributes: $attrs) {
            id
            text
          }
        }
      """, %{"id" => msg.id, "attrs" => %{"text" => "updated"}}, %{current_user: msg.creator})

      assert result["text"] == "updated"
      assert result["id"] == msg.id
    end
  end

  describe "deleteMessage" do
    test "it will delete a message by id" do
      user= insert(:user)
      msg = insert(:message, creator: user)

      {:ok, %{data: %{"deleteMessage" => result}}} = run_q("""
        mutation  DeleteMessage($id: ID!) {
          deleteMessage(messageId: $id) {
            id
            text
          }
        }
      """, %{"id" => msg.id}, %{current_user: user})

      assert result["id"] == msg.id
      refute refetch(msg)
    end
  end

  describe "createReaction" do
    test "participants can react" do
      user= insert(:user)
      msg = insert(:message)
      insert(:participant, user: user, conversation: msg.conversation)

      {:ok, %{data: %{"createReaction" => result}}} = run_q("""
        mutation  CreateReaction($messageId: ID!, $name: String!) {
          createReaction(messageId: $messageId, name: $name) {
            id
            reactions {
              userId
              name
            }
          }
        }
      """, %{"messageId" => msg.id, "name" => "dog"}, %{current_user: user})

      assert result["id"] == msg.id
      assert hd(result["reactions"])["name"] == "dog"
      assert hd(result["reactions"])["userId"] == user.id
    end
  end

  describe "deleteReaction" do
    test "participants can react" do
      user= insert(:user)
      msg = insert(:message)
      insert(:message_reaction, user: user, message: msg, name: "dog")

      {:ok, %{data: %{"deleteReaction" => result}}} = run_q("""
        mutation  DeleteReaction($messageId: ID!, $name: String!) {
          deleteReaction(messageId: $messageId, name: $name) {
            id
            reactions {
              userId
              name
            }
          }
        }
      """, %{"messageId" => msg.id, "name" => "dog"}, %{current_user: user})

      assert result["id"] == msg.id
      assert Enum.empty?(result["reactions"])
    end
  end

  describe "pinMessage" do
    test "participants can pin" do
      user= insert(:user)
      msg = insert(:message)

      {:ok, %{data: %{"pinMessage" => result}}} = run_q("""
        mutation  PinMessage($messageId: ID!, $pinned: Boolean!) {
          pinMessage(messageId: $messageId, pinned: $pinned) {
            message {
              id
              pinnedAt
            }
          }
        }
      """, %{"messageId" => msg.id, "pinned" => true}, %{current_user: user})

      assert result["message"]["id"] == msg.id
      assert result["message"]["pinnedAt"]
    end
  end

  describe "createParticipant" do
    test "it will create a participant" do
      user         = insert(:user)
      conversation = insert(:conversation)
      other_user   = insert(:user)
      insert(:participant, conversation: conversation, user: user)

      params = %{"conversationId" => conversation.id, "userId" => other_user.id}
      {:ok, %{data: %{"createParticipant" => result}}} = run_q("""
        mutation  CreateParticipant($attrs : ParticipantAttributes!) {
          createParticipant(attributes: $attrs) {
            id
            conversationId
            userId
          }
        }
      """, %{"attrs" => params}, %{current_user: user})

      assert submap?(params, result)
    end
  end

  describe "createParticipants" do
    test "it will create a list of participants" do
      user         = insert(:user)
      conversation = insert(:conversation)
      other_users   = insert_list(3, :user)
      insert(:participant, conversation: conversation, user: user)

      params = %{"conversationId" => conversation.id, "handles" => Enum.map(other_users, & &1.handle)}
      {:ok, %{data: %{"createParticipants" => result}}} = run_q("""
        mutation CreateParticipants($conversationId: ID!, $handles: [String]) {
          createParticipants(conversationId: $conversationId, handles: $handles) {
            id
            conversationId
            userId
          }
        }
      """, params, %{current_user: user})

      assert Enum.all?(result, & &1["conversationId"] == conversation.id)
      assert Enum.map(result, & &1["userId"])
             |> ids_equal(other_users)
    end
  end

  describe "deleteParticipant" do
    test "it will delete a participant" do
      user         = insert(:user)
      conversation = insert(:conversation)
      participant  = insert(:participant, conversation: conversation, user: user)

      params = %{"conversationId" => conversation.id, "userId" => user.id}
      {:ok, %{data: %{"deleteParticipant" => result}}} = run_q("""
        mutation DeleteParticipant($conversationId: ID!, $userId: ID!) {
          deleteParticipant(conversationId: $conversationId, userId: $userId) {
            id
            conversationId
            userId
          }
        }
      """, params, %{current_user: user})

      refute refetch(participant)
      assert submap?(params, result)
    end
  end

  describe "updateParticipant" do
    test "it will update a participant" do
      user         = insert(:user)
      conversation = insert(:conversation)
      insert(:participant, conversation: conversation, user: user)

      params = %{"conversationId" => conversation.id, "userId" => user.id}
      {:ok, %{data: %{"updateParticipant" => result}}} = run_q("""
        mutation UpdateParticipant($conversationId: ID!, $userId: ID!) {
          updateParticipant(
            conversationId: $conversationId,
            userId: $userId,
            notificationPreferences: {mention: true, message: false}
          ) {
            id
            conversationId
            userId
            notificationPreferences {
              mention
              message
            }
          }
        }
      """, params, %{current_user: user})

      assert result["notificationPreferences"]["mention"]
      refute result["notificationPreferences"]["message"]
    end
  end
end