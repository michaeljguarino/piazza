defmodule RtcWeb.Channels.IntegrationTest do
  use RtcWeb.ChannelCase, async: false

  alias Core.PubSub

  describe "rtc end to end" do
    test "it will publish from rabbit -> ws" do
      user = insert(:user)
      {:ok, socket} = establish_socket(user)

      ref = push_doc(socket, """
        subscription {
          newUsers {
            id
            name
            email
          }
        }
      """)

      assert_reply(ref, :ok, _)

      {:ok, _} = Rtc.Aquaduct.Broker.start_link()
      Aquaduct.Broker.publish(%Conduit.Message{body: %PubSub.UserCreated{item: insert(:user)}}, :rtc)

      assert_push("subscription:data", %{result: %{data: %{"newUsers" => doc}}})
      assert doc["id"]
      assert doc["email"]
      assert doc["name"]
    end
  end
end