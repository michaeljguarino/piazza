defmodule Rtc.PiazzaServerTest do
  use RtcWeb.ChannelCase, async: true
  alias Rtc.Piazza.Server
  alias Core.{
    ActiveUsersRequest,
    ActiveUsers,
  }

  describe "#list_active/1" do
    test "It will return user ids currently in the lobby presence" do
      user = insert(:user)
      Rtc.Presence.track(self(), "lobby", user.id, %{online_at: DateTime.utc_now()})

      %ActiveUsers{active_users: actives} = Server.list_active(%ActiveUsersRequest{
        scope: "lobby"
      }, :dummy)

      assert Enum.map(actives, & &1.user_id) == [user.id]
    end
  end
end