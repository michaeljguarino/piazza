defmodule Core.Policies.Conversation do
  use Core.Policies.Base
  alias Core.Models.{User, Conversation, Message}

  def can?(%User{}, %Conversation{}, :create), do: :pass
  def can?(%User{id: uid}, %Conversation{id: conv_id} , :update),
    do: allow_in_conversation(uid, conv_id, "Only participants can update conversations")
  def can?(%User{id: uid}, %Message{} = message, :create) do
    case Core.Repo.preload(message, [:conversation]) do
      %{conversation: %{public: true}} -> :pass
      %{conversation: conv} -> allow_in_conversation(uid, conv.id, "Only participants can message in private conversations")
    end
  end

  defp allow_in_conversation(uid, conv_id, error_msg) do
    if !!Core.Services.Conversations.get_participant(uid, conv_id),
      do: :pass, else: {:error, error_msg}
  end
end