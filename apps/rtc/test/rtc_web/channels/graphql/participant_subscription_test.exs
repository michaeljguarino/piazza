defmodule RtcWeb.Channels.ParticipantsubscriptionTest do
  use RtcWeb.ChannelCase, async: false
  alias Core.PubSub

  describe "new participants" do
    test "participants can see new participants in private conversations" do
      user = insert(:user)
      conv = insert(:conversation, public: false)
      insert(:participant, user: user, conversation: conv)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription NewParticipants($id: ID!) {
          participantDelta(conversationId: $id) {
            delta
            payload {
              id
              userId
            }
          }
        }
      """, variables: %{"id" => conv.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.ParticipantCreated{item: insert(:participant, conversation: conv)})
      assert_push("subscription:data", %{result: %{data: %{"participantDelta" => doc}}})
      assert doc["delta"] == "CREATE"
      assert doc["payload"]["userId"]
    end

    test "nonparticipants cannot see new participants in private conversations" do
      user = insert(:user)
      conv = insert(:conversation, public: false)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription NewParticipants($id: ID!) {
          participantDelta(conversationId: $id) {
            delta
            payload {
              id
              userId
            }
          }
        }
      """, variables: %{"id" => conv.id})

      refute_reply(ref, :ok, %{subscriptionId: _})
    end

    test "nonparticipants can see new participants in public conversations" do
      user = insert(:user)
      conv = insert(:conversation)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription NewParticipants($id: ID!) {
          participantDelta(conversationId: $id) {
            delta
            payload {
              id
              userId
            }
          }
        }
      """, variables: %{"id" => conv.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.ParticipantCreated{item: insert(:participant, conversation: conv)})
      assert_push("subscription:data", %{result: %{data: %{"participantDelta" => doc}}})

      assert doc["delta"] == "CREATE"
      assert doc["payload"]["id"]
      assert doc["payload"]["userId"]
    end
  end

  describe "deleted participants" do
    test "deleted participants are pushed also" do
      user = insert(:user)
      conv = insert(:conversation, public: false)
      insert(:participant, user: user, conversation: conv)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription DeletedParticipants($id: ID!) {
          participantDelta(conversationId: $id) {
            delta
            payload {
              id
              userId
            }
          }
        }
      """, variables: %{"id" => conv.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.ParticipantDeleted{item: insert(:participant, conversation: conv)})
      assert_push("subscription:data", %{result: %{data: %{"participantDelta" => doc}}})
      assert doc["delta"] == "DELETE"
      assert doc["payload"]["id"]
      assert doc["payload"]["userId"]
    end
  end

  describe "my participants" do
    test "anyone can watch for their own participant creates" do
      user = insert(:user)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription {
          participantDelta {
            delta
            payload {
              id
              userId
            }
          }
        }
      """)

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.ParticipantCreated{item: insert(:participant, user: user)})
      assert_push("subscription:data", %{result: %{data: %{"participantDelta" => doc}}})
      assert doc["delta"] == "CREATE"
      assert doc["payload"]["id"]
      assert doc["payload"]["userId"]
    end
  end
end