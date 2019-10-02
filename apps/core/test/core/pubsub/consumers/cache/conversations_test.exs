defmodule Core.PubSub.Consumers.CacheTest do
  use Core.DataCase
  alias Core.PubSub
  alias PubSub.Consumers.Cache

  describe "ParticipantCreated" do
    test "It will drop cache" do
      participant = insert(:participant)
      Core.Cache.put(:participants, participant.conversation_id, [participant])

      event = %PubSub.ParticipantCreated{item: participant}
      {:ok, true} = Cache.handle_event(event)

      {:ok, nil} = Core.Cache.get(:participants, participant.conversation_id)
    end
  end

  describe "ParticipantDeleted" do
    test "It will drop cache" do
      participant = insert(:participant)
      Core.Cache.put(:participants, participant.conversation_id, [participant])

      event = %PubSub.ParticipantDeleted{item: participant}
      {:ok, true} = Cache.handle_event(event)

      {:ok, nil} = Core.Cache.get(:participants, participant.conversation_id)
    end
  end

  describe "ParticipantUpdated" do
    test "It will drop cache" do
      participant = insert(:participant)
      Core.Cache.put(:participants, participant.conversation_id, [participant])

      event = %PubSub.ParticipantDeleted{item: participant}
      {:ok, true} = Cache.handle_event(event)

      {:ok, nil} = Core.Cache.get(:participants, participant.conversation_id)
    end
  end
end