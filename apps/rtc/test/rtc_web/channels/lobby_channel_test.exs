defmodule RtcWeb.LobbyChannelTest do
  use RtcWeb.ChannelCase, async: true

  describe "presence" do
    test "It will push new presence state" do
      user = insert(:user)
      {:ok, socket} = mk_socket(user)
      {:ok, _, _} = subscribe_and_join(socket, "lobby", %{})

      assert_broadcast "presence_diff", %{joins: joins}
      assert joins[user.id]
    end
  end
end