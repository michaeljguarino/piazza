defmodule RtcWeb.ConversationChannelTest do
  use RtcWeb.ChannelCase, async: false

  describe "presence" do
    test "participants can join a conversation channel" do
      user = insert(:user)
      conv = insert(:conversation)
      insert(:participant, conversation: conv, user: user)
      {:ok, socket} = mk_socket(user)
      {:ok, _, _} = subscribe_and_join(socket, "conversation:#{conv.id}", %{})
    end

    test "nonparticipants cannot join" do
      user = insert(:user)
      conv = insert(:conversation, public: false)
      {:ok, socket} = mk_socket(user)
      {:error, _} = subscribe_and_join(socket, "conversation:#{conv.id}", %{})
    end
  end

  describe "typing" do
    test "it will broadcast the handle to all clients" do
      user = insert(:user)
      conv = insert(:conversation)
      insert(:participant, conversation: conv, user: user)
      {:ok, socket} = mk_socket(user)
      {:ok, _, socket} = subscribe_and_join(socket, "conversation:#{conv.id}", %{})

      push(socket, "typing", %{"who" => "cares"})
      assert_broadcast "typing", %{handle: handle}

      assert handle == user.handle
    end
  end
end