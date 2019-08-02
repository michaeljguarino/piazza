defmodule Core.ServiceHandlerTest do
  use Core.DataCase, async: true
  alias Core.ServiceHandler
  alias Thrift.Generated.PingParticipant
  alias Core.Services

  describe "#ping_participant/1" do
    test "It will bump last seen for a participant" do
      user = insert(:user)
      conv = insert(:conversation)

      true = ServiceHandler.ping_participant(%PingParticipant{user_id: user.id, conversation_id: conv.id})

      assert Services.Conversations.get_participant(user.id, conv.id).last_seen_at
    end
  end
end