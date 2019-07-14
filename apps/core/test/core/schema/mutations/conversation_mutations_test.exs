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
      user = insert(:user)
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
      user = insert(:user)
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
end