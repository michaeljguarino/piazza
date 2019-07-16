defmodule RtcWeb.Channels.IntegrationTest do
  use RtcWeb.ChannelCase, async: false
  use Absinthe.Phoenix.SubscriptionTest, schema: Core.Schema

  alias Core.PubSub

  describe "rtc end to end" do
    test "it will publish from rabbit -> ws" do
      user = insert(:user)
      {:ok, socket} = connect(RtcWeb.UserSocket, %{"token" => jwt(user)}, %{})
      {:ok, socket} = Absinthe.Phoenix.SubscriptionTest.join_absinthe(socket)

      push_doc(socket, """
        subscription {
          newUsers {
            id
            name
            email
          }
        }
      """)

      {:ok, _} = Rtc.Aquaduct.Broker.start_link()
      Aquaduct.Broker.publish(%Conduit.Message{body: %PubSub.UserCreated{item: insert(:user)}}, :rtc)

      assert_push("subscription:data", %{result: %{data: %{"newUsers" => doc}}})
      assert doc["id"]
      assert doc["email"]
      assert doc["name"]
    end
  end
end