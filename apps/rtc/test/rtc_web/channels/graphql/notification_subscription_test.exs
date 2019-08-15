defmodule RtcWeb.Channels.NotificationSubscriptionTest do
  use RtcWeb.ChannelCase, async: false
  alias Core.PubSub

  describe "newNotifications" do
    test "participants can see new messages in private conversations" do
      user = insert(:user)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription {
          newNotifications {
            id
            actor {
              name
            }
            message {
              text
            }
          }
        }
      """, variables: %{})

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.NotificationCreated{item: insert(:notification, user: user)})
      assert_push("subscription:data", %{result: %{data: %{"newNotifications" => doc}}})
      assert doc["id"]
      assert doc["actor"]["name"]
      assert doc["message"]["text"]
    end
  end
end