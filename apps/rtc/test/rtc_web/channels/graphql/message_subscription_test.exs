defmodule RtcWeb.Channels.MessageSubscriptionTest do
  use RtcWeb.ChannelCase, async: false
  alias Core.PubSub

  describe "message delta" do
    test "participants can see new messages in private conversations" do
      user = insert(:user)
      conv = insert(:conversation, public: false)
      insert(:participant, user: user, conversation: conv)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription NewMessages($id: ID!) {
          messageDelta(conversationId: $id) {
            delta
            payload {
              id
              text
            }
          }
        }
      """, variables: %{"id" => conv.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.MessageCreated{item: insert(:message, conversation: conv)})
      assert_push("subscription:data", %{result: %{data: %{"messageDelta" => doc}}})
      assert doc["delta"] == "CREATE"
      assert doc["payload"]["id"]
      assert doc["payload"]["text"]
    end

    test "you won't see new messages in other conversations" do
      user = insert(:user)
      conv = insert(:conversation, public: false)
      insert(:participant, user: user, conversation: conv)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription MessageDelta($id: ID!) {
          messageDelta(conversationId: $id) {
            delta
            payload {
              id
              text
            }
          }
        }
      """, variables: %{"id" => conv.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.MessageCreated{item: insert(:message)})
      refute_push("subscription:data", %{result: %{data: %{"messageDelta" => _doc}}})
    end

    test "nonparticipants cannot see new messages in private conversations" do
      user = insert(:user)
      conv = insert(:conversation, public: false)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription MessageDelta($id: ID!) {
          messageDelta(conversationId: $id) {
            delta
            payload {
              id
              text
            }
          }
        }
      """, variables: %{"id" => conv.id})

      refute_reply(ref, :ok, %{subscriptionId: _})
    end

    test "nonparticipants can see new messages in public conversations" do
      user = insert(:user)
      conv = insert(:conversation)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription MessageDelta($id: ID!) {
          messageDelta(conversationId: $id) {
            delta
            payload {
              id
              text
            }
          }
        }
      """, variables: %{"id" => conv.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.MessageCreated{item: insert(:message, conversation: conv)})
      assert_push("subscription:data", %{result: %{data: %{"messageDelta" => doc}}})
      assert doc["delta"] == "CREATE"
      assert doc["payload"]["id"]
      assert doc["payload"]["text"]
    end
  end
end