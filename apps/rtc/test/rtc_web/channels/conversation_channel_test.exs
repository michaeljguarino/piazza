defmodule RtcWeb.ConversationChannelTest do
  use RtcWeb.ChannelCase, async: false
  alias Core.Services.Conversations
  alias Thrift.Generated.GqlService.Binary.Framed.Client
  import Mock

  describe "presence" do
    test "participants can join a conversation channel" do
      with_mock Client, [
        start_link: fn _, _ -> {:ok, :dummy} end,
        ping_participant: fn _, _ -> :ok end
      ] do
        user = insert(:user)
        conv = insert(:conversation)
        insert(:participant, conversation: conv, user: user)
        {:ok, socket} = mk_socket(user)
        {:ok, _, _} = subscribe_and_join(socket, "conversation:#{conv.id}", %{})
      end
    end

    test "nonparticipants cannot join" do
      with_mock Client, [
        start_link: fn _, _ -> {:ok, :dummy} end,
        ping_participant: fn _, _ -> :ok end
      ] do
        user = insert(:user)
        conv = insert(:conversation, public: false)
        {:ok, socket} = mk_socket(user)
        {:error, _} = subscribe_and_join(socket, "conversation:#{conv.id}", %{})
      end
    end
  end

  describe "typing" do
    test "it will broadcast the handle to all clients" do
      with_mock Client, [
        start_link: fn _, _ -> {:ok, :dummy} end,
        ping_participant: fn _, _ -> :ok end
      ] do
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

  describe "ping" do
    @tag :skip
    test "It will bump the participants last_seen_at" do
      user = insert(:user)
      conv = insert(:conversation)
      {:ok, socket} = mk_socket(user)
      {:ok, _, socket} = subscribe_and_join(socket, "conversation:#{conv.id}", %{})

      ref = push(socket, "ping", %{"who" => "cares"})
      assert_reply ref, :ok, _payload

      participant = Conversations.get_participant(user.id, conv.id)
      assert participant.last_seen_at
    end
  end
end