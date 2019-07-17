defmodule Core.Policies.Conversation do
  use Core.Policies.Base
  alias Core.Models.{User, Conversation, Message, Participant}

  def can?(%User{}, %Conversation{}, :create), do: :pass
  def can?(%User{id: uid}, %Message{} = message, :create) do
    case Core.Repo.preload(message, [:conversation]) do
      %{conversation: %{public: true}} -> :pass
      %{conversation: conv} -> allow_in_conversation(uid, conv.id, "Only participants can message in private conversations")
    end
  end
  def can?(%User{} = user, %Participant{} = participant, :create) do
    %{conversation: conv} = Core.Repo.preload(participant, [:conversation])
    can?(user, conv, :update)
  end

  def can?(%User{}, %Conversation{public: true}, :access), do: :pass
  def can?(%User{id: uid}, %Conversation{id: conv_id} , :access),
    do: allow_in_conversation(uid, conv_id, "Only participants can access private conversations")

  def can?(%User{id: uid}, %Conversation{id: conv_id} , :update),
    do: allow_in_conversation(uid, conv_id, "Only participants can update conversations")

  def can?(%User{id: uid}, %Participant{user_id: uid}, :delete), do: :continue
  def can?(%User{} = user, %Participant{} = participant, :delete) do
    %{conversation: conv} = Core.Repo.preload(participant, [:conversation])
    can?(user, conv, :update)
  end

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, "Forbidden"}

  defp allow_in_conversation(uid, conv_id, error_msg) do
    if !!Core.Services.Conversations.get_participant(uid, conv_id),
      do: :continue, else: {:error, error_msg}
  end
end