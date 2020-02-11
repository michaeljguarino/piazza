defmodule Core.PubSub.Consumers.CacheTest do
  use Core.DataCase, async: true
  alias Core.PubSub
  alias PubSub.Consumers.Cache

  describe "ParticipantCreated" do
    test "It will drop cache" do
      participant = insert(:participant)
      Core.Cache.set({:participants, participant.conversation_id}, [])

      event = %PubSub.ParticipantCreated{item: participant}
      Cache.handle_event(event)

      [^participant] = Core.Cache.get({:participants, participant.conversation_id})
    end
  end

  describe "ParticipantDeleted" do
    test "It will drop cache" do
      participant = insert(:participant)
      Core.Cache.set({:participants, participant.conversation_id}, [participant])

      event = %PubSub.ParticipantDeleted{item: participant}
      Cache.handle_event(event)

      [] = Core.Cache.get({:participants, participant.conversation_id})
    end

    test "It will ignore if the conversation is a chat" do
      participant = insert(:participant, conversation: build(:conversation, chat: true))

      event = %PubSub.ParticipantDeleted{item: participant}
      :ok = Cache.handle_event(event)
    end
  end

  describe "ParticipantUpdated" do
    test "It will drop cache" do
      participant = insert(:participant)
      Core.Cache.set({:participants, participant.conversation_id}, [%{participant | user: nil}])

      event = %PubSub.ParticipantUpdated{item: participant}
      Cache.handle_event(event)

      [^participant] = Core.Cache.get({:participants, participant.conversation_id})
    end
  end
end