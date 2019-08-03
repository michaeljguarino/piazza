defmodule RtcWeb.Channels.ConversationSubscriptionTest do
  use RtcWeb.ChannelCase, async: false
  alias Core.PubSub

  describe "conversation delta" do
    test "A participant can subscribe to conversation updates" do
      user = insert(:user)
      conv = insert(:conversation)
      insert(:participant, user: user, conversation: conv)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription UpdatedConversation($id: ID!) {
          conversationDelta(id: $id) {
            delta
            payload {
              id
              name
            }
          }
        }
      """, variables: %{"id" => conv.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.ConversationUpdated{item: conv})
      assert_push("subscription:data", %{result: %{data: %{"conversationDelta" => doc}}})
      assert doc["delta"] == "UPDATE"
      assert doc["payload"]["id"]
      assert doc["payload"]["name"]
    end

    test "A nonparticipant cannot subscribe to private conversations" do
      user = insert(:user)
      conv = insert(:conversation, public: false)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription UpdatedConversation($id: ID!) {
          conversationDelta(id: $id) {
            delta
            payload {
              id
              name
            }
          }
        }
      """, variables: %{"id" => conv.id})

      refute_reply(ref, :ok, %{subscriptionId: _})
    end
  end
end