defmodule RtcWeb.Channels.UserSubscriptionTest do
  use RtcWeb.ChannelCase, async: false
  alias Core.PubSub

  describe "user delta" do
    @tag :skip
    test "users can subscribe to see new users" do
      user = insert(:user)
      {:ok, socket} = establish_socket(user)

      push_doc(socket, """
        subscription {
          userDelta {
            delta
            payload {
              id
              name
              email
            }
          }
        }
      """)

      publish_event(%PubSub.UserCreated{item: insert(:user)})
      assert_push("subscription:data", %{result: %{data: %{"userDelta" => doc}}})
      assert doc["delta"] == "CREATE"
      assert doc["payload"]["id"]
      assert doc["payload"]["email"]
      assert doc["payload"]["name"]
    end

    test "users can see updated users" do
      user = insert(:user)
      updated = insert(:user)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription {
          userDelta {
            delta
            payload {
              id
              name
              email
            }
          }
        }
      """, variables: %{"userId" => updated.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.UserUpdated{item: updated})
      assert_push("subscription:data", %{result: %{data: %{"userDelta" => doc}}})
      assert doc["delta"] == "UPDATE"
      assert doc["payload"]["id"]
      assert doc["payload"]["email"]
      assert doc["payload"]["name"]
    end
  end
end