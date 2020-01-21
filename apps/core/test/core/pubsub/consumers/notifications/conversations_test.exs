defmodule Core.PubSub.Consumers.Notifications.ConversationsTest do
  use Core.DataCase, async: true
  import Mock
  alias Core.{ActiveUsers, ActiveUser}
  alias Core.PubSub
  alias Core.PubSub.Consumers.Notifications

  describe "MessageCreated" do
    test "It will notify all mentions" do
      msg = insert(:message)
      mentions = insert_list(3, :message_entity, message: msg)

      event = %PubSub.MessageCreated{item: msg}
      {:ok, notifs} = Notifications.handle_event(event)

      assert length(notifs) == 3
      assert Enum.all?(notifs, & &1.type == :mention)
      assert Enum.all?(notifs, & &1.actor_id == msg.creator_id)
      assert Enum.map(notifs, & &1.user_id)
             |> ids_equal(Enum.map(mentions, & &1.user_id))

      for notif <- notifs,
        do: assert_receive {:event, %PubSub.NotificationCreated{item: ^notif}}
    end

    test "It will notify all mentions and participants if @all is used" do
      msg = insert(:message)
      mentions = insert_list(3, :message_entity, message: msg)
      insert(:message_entity, message: msg, type: :channel_mention, text: "all")
      participant = insert(:participant, conversation: msg.conversation)

      event = %PubSub.MessageCreated{item: msg}
      {:ok, notifs} = Notifications.handle_event(event)

      assert length(notifs) == 4
      assert Enum.all?(notifs, & &1.type == :mention)
      assert Enum.all?(notifs, & &1.actor_id == msg.creator_id)
      assert Enum.map(notifs, & &1.user_id)
             |> ids_equal([participant.user_id | Enum.map(mentions, & &1.user_id)])

      for notif <- notifs,
        do: assert_receive {:event, %PubSub.NotificationCreated{item: ^notif}}
    end

    test "It will notify online participants if @here is used" do
      user = insert(:user)
      with_mock Core.PiazzaRtc.Stub, [list_active: fn :dummy, %{scope: "lobby"} ->
        {:ok, %ActiveUsers{active_users: [%ActiveUser{user_id: user.id}]}}
      end] do
        msg = insert(:message)
        insert(:message_entity, message: msg, type: :channel_mention, text: "here")
        insert(:participant, conversation: msg.conversation, user: user)
        insert(:participant, conversation: msg.conversation)

        event = %PubSub.MessageCreated{item: msg}
        {:ok, [notif]} = Notifications.handle_event(event)

        assert notif.type == :mention
        assert notif.user_id == user.id
      end
    end

    test "It will notify participants with message enabled" do
      msg = insert(:message)
      insert_list(2, :participant, conversation: msg.conversation)
      notified = insert_list(3, :participant,
        conversation: msg.conversation,
        notification_preferences: %{message: true}
      )

      event = %PubSub.MessageCreated{item: msg}
      {:ok, notifs} = Notifications.handle_event(event)

      assert length(notifs) == 3
      assert Enum.all?(notifs, & &1.type == :message)
      assert Enum.map(notifs, & &1.user_id)
             |> ids_equal(Enum.map(notified, & &1.user))
    end

    test "It will not double notify on mention/message" do
      msg = insert(:message)
      [first | _] = insert_list(3, :participant,
        conversation: msg.conversation,
        notification_preferences: %{message: true}
      )
      insert(:message_entity, message: msg, user: first.user)

      event = %PubSub.MessageCreated{item: msg}
      {:ok, notifs} = Notifications.handle_event(event)

      assert length(notifs) == 3
      assert Enum.find(notifs, & &1.user_id == first.user_id).type == :mention
    end

    test "It will respect notification preferences" do
      msg = insert(:message)
      insert(:message_entity, message: msg, user: build(:user, notification_preferences: %{mention: false}))

      event = %PubSub.MessageCreated{item: msg}
      :ok = Notifications.handle_event(event)
    end
  end
end