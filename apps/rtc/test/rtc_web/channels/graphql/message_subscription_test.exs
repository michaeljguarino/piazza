defmodule RtcWeb.Channels.MessageSubscriptionTest do
  use RtcWeb.ChannelCase, async: false
  alias Core.PubSub

  describe "fanout message delta" do
    test "users can see created messages" do
      user = insert(:user)

      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription {
          messageDelta {
            delta
            payload {
              id
              text
            }
          }
        }
      """)

      assert_reply(ref, :ok, %{subscriptionId: _})

      msg = insert(:message)
      publish_event(%PubSub.MessageFanout{item: msg, user: user, delta: PubSub.MessageCreated})

      assert_push("subscription:data", %{result: %{data: %{"messageDelta" => doc}}})
      assert doc["delta"] == "CREATE"
      assert doc["payload"]["id"] == msg.id
      assert doc["payload"]["text"] == msg.text
    end

    test "users can see deleted messages" do
      user = insert(:user)

      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription {
          messageDelta {
            delta
            payload {
              id
              text
            }
          }
        }
      """)

      assert_reply(ref, :ok, %{subscriptionId: _})

      msg = insert(:message)
      publish_event(%PubSub.MessageFanout{item: msg, user: user, delta: PubSub.MessageDeleted})

      assert_push("subscription:data", %{result: %{data: %{"messageDelta" => doc}}})
      assert doc["delta"] == "DELETE"
      assert doc["payload"]["id"] == msg.id
      assert doc["payload"]["text"] == msg.text
    end

    test "users can see updated messages" do
      user = insert(:user)

      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription {
          messageDelta {
            delta
            payload {
              id
              text
            }
          }
        }
      """)

      assert_reply(ref, :ok, %{subscriptionId: _})

      msg = insert(:message)
      publish_event(%PubSub.MessageFanout{item: msg, user: user, delta: PubSub.MessageUpdated})

      assert_push("subscription:data", %{result: %{data: %{"messageDelta" => doc}}})
      assert doc["delta"] == "UPDATE"
      assert doc["payload"]["id"] == msg.id
      assert doc["payload"]["text"] == msg.text
    end
  end

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

    test "participants can see deleted messages" do
      user = insert(:user)
      conv = insert(:conversation)
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

      publish_event(%PubSub.MessageDeleted{item: insert(:message, conversation: conv)})
      assert_push("subscription:data", %{result: %{data: %{"messageDelta" => doc}}})
      assert doc["delta"] == "DELETE"
      assert doc["payload"]["id"]
      assert doc["payload"]["text"]
    end

    test "participants can see updated messages" do
      user = insert(:user)
      conv = insert(:conversation)
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

      publish_event(%PubSub.MessageUpdated{item: insert(:message, conversation: conv)})
      assert_push("subscription:data", %{result: %{data: %{"messageDelta" => doc}}})
      assert doc["delta"] == "UPDATE"
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

  describe "pinned message delta" do
    test "participants can see created pinned messages" do
      user = insert(:user)
      conv = insert(:conversation, public: false)
      insert(:participant, user: user, conversation: conv)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription PinnedMessages($id: ID!) {
          pinnedMessageDelta(conversationId: $id) {
            delta
            payload {
              id
              message {
                text
              }
            }
          }
        }
      """, variables: %{"id" => conv.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.PinnedMessageCreated{item: insert(:pinned_message, conversation: conv)})
      assert_push("subscription:data", %{result: %{data: %{"pinnedMessageDelta" => doc}}})
      assert doc["delta"] == "CREATE"
      assert doc["payload"]["id"]
      assert doc["payload"]["message"]["text"]
    end

    test "participants can see deleted pinned messages" do
      user = insert(:user)
      conv = insert(:conversation, public: false)
      insert(:participant, user: user, conversation: conv)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription PinnedMessages($id: ID!) {
          pinnedMessageDelta(conversationId: $id) {
            delta
            payload {
              id
              message {
                text
              }
            }
          }
        }
      """, variables: %{"id" => conv.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.PinnedMessageDeleted{item: insert(:pinned_message, conversation: conv)})
      assert_push("subscription:data", %{result: %{data: %{"pinnedMessageDelta" => doc}}})
      assert doc["delta"] == "DELETE"
      assert doc["payload"]["id"]
      assert doc["payload"]["message"]["text"]
    end

    test "non participants cannot subscribe" do
      user = insert(:user)
      conv = insert(:conversation, public: false)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription PinnedMessages($id: ID!) {
          pinnedMessageDelta(conversationId: $id) {
            delta
            payload {
              id
              message {
                text
              }
            }
          }
        }
      """, variables: %{"id" => conv.id})

      refute_reply(ref, :ok, %{subscriptionId: _})
    end
  end

  describe "dialog" do
    test "It will send to a given user" do
      user = insert(:user)
      msg  = insert(:message, creator: user)
      bot  = insert(:user, bot: true)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription {
          dialog {
            anchorMessage {
              id
            }
            user {
              id
            }
            structuredMessage
          }
        }
      """)

      assert_reply(ref, :ok, %{subscriptionId: _})

      structured_message = "<root><text>Hello World!</text></root>"
      {:ok, dialog} = Core.Models.Dialog.build_dialog(structured_message, msg, bot)
      publish_event(%PubSub.DialogCreated{item: dialog})

      assert_push("subscription:data", %{result: %{data: %{"dialog" => doc}}})
      assert doc["anchorMessage"]["id"] == msg.id
      assert doc["user"]["id"] == bot.id
      assert is_map(doc["structuredMessage"])
    end
  end
end