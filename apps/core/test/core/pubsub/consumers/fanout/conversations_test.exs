defmodule Core.PubSub.Consumers.Fanout.ConversationsTest do
  use Core.DataCase
  alias Core.PubSub
  alias Core.PubSub.Consumers.Fanout

  describe "MessageCreated" do
    test "It will fan out to all participants" do
      %{conversation: conv} = message = insert(:message)
      participants = insert_list(3, :participant, conversation: conv)

      event = %PubSub.MessageCreated{item: message}
      :ok = Fanout.handle_event(event)

      for %{user_id: id} <- participants,
        do: assert_receive {:event, %PubSub.MessageFanout{
          item: ^message,
          user: %{id: ^id},
          delta: PubSub.MessageCreated
        }}
    end
  end

  describe "MessageUpdated" do
    test "It will fan out to all participants" do
      %{conversation: conv} = message = insert(:message)
      participants = insert_list(3, :participant, conversation: conv)

      event = %PubSub.MessageUpdated{item: message}
      :ok = Fanout.handle_event(event)

      for %{user_id: id} <- participants,
        do: assert_receive {:event, %PubSub.MessageFanout{
          item: ^message,
          user: %{id: ^id},
          delta: PubSub.MessageUpdated
        }}
    end
  end

  describe "MessageDeleted" do
    test "It will fan out to all participants" do
      %{conversation: conv} = message = insert(:message)
      participants = insert_list(3, :participant, conversation: conv)

      event = %PubSub.MessageDeleted{item: message}
      :ok = Fanout.handle_event(event)

      for %{user_id: id} <- participants,
        do: assert_receive {:event, %PubSub.MessageFanout{
          item: ^message,
          user: %{id: ^id},
          delta: PubSub.MessageDeleted
        }}
    end
  end
end