defmodule RtcWeb.Channels.UserSubscriptionTest do
  use RtcWeb.ChannelCase, async: false
  alias Core.PubSub

  describe "newUsers" do
    test "users can subscribe to see new users" do
      user = insert(:user)
      {:ok, socket} = establish_socket(user)

      push_doc(socket, """
        subscription {
          newUsers {
            id
            name
            email
          }
        }
      """)

      publish_event(%PubSub.UserCreated{item: insert(:user)})
      assert_push("subscription:data", %{result: %{data: %{"newUsers" => doc}}})
      assert doc["id"]
      assert doc["email"]
      assert doc["name"]
    end
  end

  describe "updatedUsers" do
    test "users can see updated users" do
      user = insert(:user)
      updated = insert(:user)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription UpdatedUsers($userId: ID!) {
          updatedUsers(id: $userId) {
            id
            name
            email
          }
        }
      """, variables: %{"userId" => updated.id})

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.UserUpdated{item: updated})
      assert_push("subscription:data", %{result: %{data: %{"updatedUsers" => doc}}})
      assert doc["id"]
      assert doc["email"]
      assert doc["name"]
    end
  end
end