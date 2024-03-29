defmodule Core.Piazza.Server do
  use GRPC.Server, service: Core.Piazza.Service
  alias Core.Services
  alias Core.Models.{Conversation, User, Participant}
  alias Core.{
    PingConversationRequest,
    LeaveConversationRequest,
    PingResponse
  }

  @spec ping_conversation(PingConversationRequest.t, GRPC.Server.Stream.t) :: PingResponse.t
  def ping_conversation(%PingConversationRequest{user_id: uid, conversation_id: cid}, _) do
    with %Conversation{} <- Services.Conversations.get_conversation(cid),
         %User{} = user <- Services.Users.get_user(uid),
         {:ok, _} <- Services.Conversations.bump_last_seen(cid, user) do
      PingResponse.new(fulfilled: true)
    else
      _ -> PingResponse.new(fulfilled: false)
    end
  end

  @spec leave_conversation(LeaveConversationRequest.t, GRPC.Server.Stream.t) :: PingResponse.t
  def leave_conversation(%LeaveConversationRequest{user_id: uid, conversation_id: cid}, _) do
    with %Conversation{} <- Services.Conversations.get_conversation(cid),
         %User{} = user <- Services.Users.get_user(uid),
         %Participant{deleted_at: nil} <- Services.Conversations.get_participant(uid, cid),
         {:ok, _} <- Services.Conversations.bump_last_seen(cid, user) do
      PingResponse.new(fulfilled: true)
    else
      _ -> PingResponse.new(fulfilled: false)
    end
  end
end

defmodule Core.Piazza.Endpoint do
  use GRPC.Endpoint

  intercept GRPC.Logger.Server
  run Core.Piazza.Server
end