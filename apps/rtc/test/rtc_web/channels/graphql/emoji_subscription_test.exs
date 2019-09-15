defmodule RtcWeb.Channels.EmojiSubscriptionTest do
  use RtcWeb.ChannelCase, async: false
  alias Core.PubSub

  describe "emoji delta" do
    test "Anyone can subscribe to emoji updates" do
      user = insert(:user)
      emoji = insert(:emoji)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription {
          emojiDelta {
            delta
            payload {
              id
              name
            }
          }
        }
      """)

      assert_reply(ref, :ok, %{subscriptionId: _})

      publish_event(%PubSub.EmojiCreated{item: emoji})
      assert_push("subscription:data", %{result: %{data: %{"emojiDelta" => doc}}})
      assert doc["delta"] == "CREATE"
      assert doc["payload"]["id"] == emoji.id
      assert doc["payload"]["name"] == emoji.name
    end
  end
end