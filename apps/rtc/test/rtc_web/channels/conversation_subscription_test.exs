defmodule RtcWeb.Channels.ConversationSubscriptionTest do
  use RtcWeb.ChannelCase, async: false
  alias Core.PubSub

  describe "newConversations" do
    test "users can see new public conversations" do
      user = insert(:user)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription {
          newConversations {
            id
            name
          }
        }
      """)

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.ConversationCreated{item: insert(:conversation, public: true)})
      assert_push("subscription:data", %{result: %{data: %{"newConversations" => doc}}})
      assert doc["id"]
      assert doc["name"]

      publish_event(%PubSub.ConversationCreated{item: insert(:conversation, public: false)})
      refute_push("subscription:data", %{result: %{data: %{"newConversations" => _}}})
    end
  end

  describe "updatedConversations" do
    test "A participant can subscribe to conversation updates" do
      user = insert(:user)
      conv = insert(:conversation)
      insert(:participant, user: user, conversation: conv)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription UpdatedConversation($id: ID!) {
          updatedConversations(id: $id) {
            id
            name
          }
        }
      """, variables: %{"id" => conv.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.ConversationUpdated{item: conv})
      assert_push("subscription:data", %{result: %{data: %{"updatedConversations" => doc}}})
      assert doc["id"]
      assert doc["name"]
    end

    test "A nonparticipant cannot subscribe to private conversations" do
      user = insert(:user)
      conv = insert(:conversation, public: false)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription UpdatedConversation($id: ID!) {
          updatedConversations(id: $id) {
            id
            name
          }
        }
      """, variables: %{"id" => conv.id})

      refute_reply(ref, :ok, %{subscriptionId: _})
    end
  end
end