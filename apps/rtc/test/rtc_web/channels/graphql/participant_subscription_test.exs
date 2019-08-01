defmodule RtcWeb.Channels.ParticipantsubscriptionTest do
  use RtcWeb.ChannelCase, async: false
  alias Core.PubSub

  describe "newParticipants" do
    test "participants can see new participants in private conversations" do
      user = insert(:user)
      conv = insert(:conversation, public: false)
      insert(:participant, user: user, conversation: conv)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription NewParticipants($id: ID!) {
          newParticipants(conversationId: $id) {
            id
            userId
          }
        }
      """, variables: %{"id" => conv.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.ParticipantCreated{item: insert(:participant, conversation: conv)})
      assert_push("subscription:data", %{result: %{data: %{"newParticipants" => doc}}})
      assert doc["id"]
      assert doc["userId"]
    end

    test "nonparticipants cannot see new participants in private conversations" do
      user = insert(:user)
      conv = insert(:conversation, public: false)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription NewParticipants($id: ID!) {
          newParticipants(conversationId: $id) {
            id
            userId
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
          newParticipants(conversationId: $id) {
            id
            userId
          }
        }
      """, variables: %{"id" => conv.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.ParticipantCreated{item: insert(:participant, conversation: conv)})
      assert_push("subscription:data", %{result: %{data: %{"newParticipants" => doc}}})
      assert doc["id"]
      assert doc["userId"]
    end
  end

  describe "deletedParticipants" do
    test "participants can see deleted participants in private conversations" do
      user = insert(:user)
      conv = insert(:conversation, public: false)
      insert(:participant, user: user, conversation: conv)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription DeletedParticipants($id: ID!) {
          deletedParticipants(conversationId: $id) {
            id
            userId
          }
        }
      """, variables: %{"id" => conv.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.ParticipantDeleted{item: insert(:participant, conversation: conv)})
      assert_push("subscription:data", %{result: %{data: %{"deletedParticipants" => doc}}})
      assert doc["id"]
      assert doc["userId"]
    end

    test "nonparticipants cannot see deleted participants in private conversations" do
      user = insert(:user)
      conv = insert(:conversation, public: false)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription DeletedParticipants($id: ID!) {
          deletedParticipants(conversationId: $id) {
            id
            userId
          }
        }
      """, variables: %{"id" => conv.id})

      refute_reply(ref, :ok, %{subscriptionId: _})
    end

    test "nonparticipants can see deleted participants in public conversations" do
      user = insert(:user)
      conv = insert(:conversation)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription DeletedParticipants($id: ID!) {
          deletedParticipants(conversationId: $id) {
            id
            userId
          }
        }
      """, variables: %{"id" => conv.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.ParticipantDeleted{item: insert(:participant, conversation: conv)})
      assert_push("subscription:data", %{result: %{data: %{"deletedParticipants" => doc}}})
      assert doc["id"]
      assert doc["userId"]
    end
  end

  describe "myParticipants" do
    test "anyone can watch for their own participant creates" do
      user = insert(:user)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription {
          myParticipants {
            id
            userId
          }
        }
      """)

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.ParticipantCreated{item: insert(:participant, user: user)})
      assert_push("subscription:data", %{result: %{data: %{"myParticipants" => doc}}})
      assert doc["id"]
      assert doc["userId"]
    end
  end
end