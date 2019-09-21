defmodule Rtc.ServiceHandlerTest do
  use RtcWeb.ChannelCase, async: true
  alias Rtc.ServiceHandler
  alias Thrift.Generated.{
    ActiveUserRequest, 
    ActiveUsers, 
  } 

  describe "#list_active/1" do
    test "It will return user ids currently in the lobby presence" do
      user = insert(:user)
      Rtc.Presence.track(self(), "lobby", user.id, %{online_at: DateTime.utc_now()})

      %ActiveUsers{active_users: actives} = ServiceHandler.list_active(%ActiveUserRequest{
        scope: "lobby"
      })

      assert Enum.map(actives, & &1.user_id) == [user.id]
    end
  end
end