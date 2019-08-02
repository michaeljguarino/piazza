defmodule Core.ServiceHandler do
  @behaviour Thrift.Generated.Service.Handler
  alias Thrift.Generated.PingParticipant
  alias Core.Services
  alias Core.Models.{Conversation, User}

  def ping_participant(%PingParticipant{user_id: user_id, conversation_id: conversation_id}) do
    with %Conversation{} <- Services.Conversations.get_conversation(conversation_id),
         %User{} = user <- Services.Users.get_user(user_id),
         {:ok, _} <- Services.Conversations.bump_last_seen(conversation_id, user) do
      true
    else
      _ -> false
    end
  end
end