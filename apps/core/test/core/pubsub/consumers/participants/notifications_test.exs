defmodule Core.PubSub.Participants.NotificationsTest do
  use Core.DataCase
  alias Core.PubSub
  alias Core.PubSub.Participants

  describe "NotificationCreated" do
    test "it will add a participant" do
      %{conversation: conv, user: user} = insert(:participant)
      message = insert(:message, conversation: conv)
      notif = insert(:notification, actor: user, message: message)
      event = %PubSub.NotificationCreated{item: notif}
      {:ok, participant} = Participants.handle_event(event)

      assert participant.user_id == notif.user_id
      assert participant.conversation_id == notif.message.conversation_id
    end

    test "It will upsert soft deleted participants" do
      %{conversation: conv, user: user} = insert(:participant, deleted_at: DateTime.utc_now())
      message = insert(:message, conversation: conv)
      notif = insert(:notification, user: user, message: message)
      
      event = %PubSub.NotificationCreated{item: notif}
      {:ok, participant} = Participants.handle_event(event)

      assert participant.user_id == user.id
      assert participant.conversation_id == conv.id
      refute participant.deleted_at
    end

    test "it will ignore if the participant exists" do
      %{conversation: conv, user: user} = insert(:participant)
      message = insert(:message, conversation: conv)
      notif = insert(:notification, user: user, message: message)
      
      event = %PubSub.NotificationCreated{item: notif}
      :ok = Participants.handle_event(event)
    end
  end
end