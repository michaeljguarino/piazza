defmodule Core.Piazza.ServerTest do
  use Core.DataCase, async: true
  alias Core.Piazza.Server
  alias Core.{
    PingConversationRequest,
    LeaveConversationRequest,
    PingResponse
  }

  describe "#ping_conversation" do
    test "It will bump the last seen timestamp of a participant" do
      participant = insert(:participant)

      %PingResponse{fulfilled: true} = Server.ping_conversation(%PingConversationRequest{
        user_id: participant.user_id,
        conversation_id: participant.conversation_id
      }, :dummy)

      assert refetch(participant).last_seen_at
    end
  end

  describe "#leave_conversation" do
    test "It will bump last seen if the participant exists" do
      participant = insert(:participant)

      %PingResponse{fulfilled: true} = Server.ping_conversation(%PingConversationRequest{
        user_id: participant.user_id,
        conversation_id: participant.conversation_id
      }, :dummy)

      assert refetch(participant).last_seen_at
    end

    test "If the participant was deleted, it'll ignore" do
      user = insert(:user)
      conversation = insert(:conversation)
      insert(:participant, user: user, conversation: conversation, deleted_at: Timex.now())

      %PingResponse{fulfilled: false} = Server.leave_conversation(%LeaveConversationRequest{
        user_id: user.id,
        conversation_id: conversation.id
      }, :dummy)

      refute Core.Services.Conversations.get_participant(conversation.id, user.id)
    end
  end
end