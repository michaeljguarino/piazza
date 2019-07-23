defmodule Core.PubSub.Consumers.Notifications.ConversationsTest do
  use Core.DataCase, async: true

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
  end
end