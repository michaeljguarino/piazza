defmodule Core.Policies.Invite do
  use Piazza.Policy
  alias Core.Models.{User, Invite}
  alias Core.Services.Conversations
  alias Core.Policies.Conversation

  def can?(%User{} = user, %Invite{type: :conversation, reference: conv_id}, :create) do
    conversation = Conversations.get_conversation!(conv_id)
    Conversation.can?(user, conversation, :update)
  end

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, "Forbidden"}
end