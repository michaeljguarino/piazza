defmodule Core.Services.Conversations do
  use Core.Services.Base
  alias Core.Models.{Conversation, Message, Participant}
  import Core.Policies.Conversation

  def get_conversation!(id), do: Core.Repo.get!(Conversation, id)

  def get_participant(user_id, conv_id), do: Core.Repo.get_by(Participant, user_id: user_id, conversation_id: conv_id)

  def create_conversation(attrs, user) do
    %Conversation{creator_id: user.id}
    |> Conversation.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
  end

  def update_conversation(id, attrs, user) do
    get_conversation!(id)
    |> Conversation.changeset(attrs)
    |> allow(user, :update)
    |> when_ok(:update)
  end

  def create_message(conv_id, attrs, user) do
    %Message{conversation_id: conv_id, creator_id: user.id}
    |> Message.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
  end
end