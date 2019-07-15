defmodule Core.Schema.ConversationMutationsTest do
  use Core.DataCase, async: true
  alias Core.Models.{Conversation, Message}

  describe "createConveration" do
    test "It will create a new conversation" do
      user = insert(:user)

      params = %{"name" => "new_conversation", "public" => false}
      {:ok, %{data: %{"createConversation" => result}}} = run_query("""
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

  describe "updateConversation" do
    test "it will update a conversation by id" do
      user         = insert(:user)
      conversation = insert(:conversation)
      insert(:participant, conversation: conversation, user: user)

      params = %{"name" => "new conversation", "public" => false}
      {:ok, %{data: %{"updateConversation" => result}}} = run_query("""
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

  describe "createMessage" do
    test "it will update a conversation by id" do
      user         = insert(:user)
      conversation = insert(:conversation)
      insert(:participant, conversation: conversation, user: user)

      params = %{"text" => "my message"}
      {:ok, %{data: %{"createMessage" => result}}} = run_query("""
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

  describe "createParticipant" do
    test "it will update a conversation by id" do
      user         = insert(:user)
      conversation = insert(:conversation)
      other_user   = insert(:user)
      insert(:participant, conversation: conversation, user: user)

      params = %{"conversationId" => conversation.id, "userId" => other_user.id}
      {:ok, %{data: %{"createParticipant" => result}}} = run_query("""
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

  describe "deleteParticipant" do
    test "it will update a conversation by id" do
      user         = insert(:user)
      conversation = insert(:conversation)
      participant  = insert(:participant, conversation: conversation, user: user)

      params = %{"conversationId" => conversation.id, "userId" => user.id}
      {:ok, %{data: %{"deleteParticipant" => result}}} = run_query("""
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
end