defmodule Core.PubSub.Consumers.Integrity.ConversationsTest do
  use Core.DataCase
  alias Core.PubSub
  alias PubSub.Consumers.Integrity
  alias Core.Services.Conversations


  describe "ConversationCreated" do
    test "It will add all users the conversation if it was global" do
      conv = insert(:conversation, global: true)
      users = insert_list(3, :user)

      event = %PubSub.ConversationCreated{item: conv}
      3 = Integrity.handle_event(event)

      for %{id: user_id} <- users,
        do: assert Conversations.get_participant(user_id, conv.id)
    end

    test "It will ignore if the conversation is not global" do
      conv = insert(:conversation)
      insert_list(3, :user)

      event = %PubSub.ConversationCreated{item: conv}
      :ok = Integrity.handle_event(event)
    end
  end
end