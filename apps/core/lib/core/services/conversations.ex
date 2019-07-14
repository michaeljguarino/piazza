defmodule Core.Services.Conversations do
  use Core.Services.Base
  alias Core.Models.{Conversation, Message, Participant}
  alias Core.PubSub.{
    ConversationCreated,
    ConversationUpdated,
    MessageCreated
  }
  import Core.Policies.Conversation

  def get_conversation!(id), do: Core.Repo.get!(Conversation, id)

  def get_participant(user_id, conv_id), do: Core.Repo.get_by(Participant, user_id: user_id, conversation_id: conv_id)

  def create_conversation(attrs, user) do
    %Conversation{creator_id: user.id}
    |> Conversation.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
    |> notify(:create, user)
  end

  def update_conversation(id, attrs, user) do
    get_conversation!(id)
    |> Conversation.changeset(attrs)
    |> allow(user, :update)
    |> when_ok(:update)
    |> notify(:update, user)
  end

  def create_message(conv_id, attrs, user) do
    %Message{conversation_id: conv_id, creator_id: user.id}
    |> Message.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
    |> notify(:create, user)
  end

  def notify({:ok, %Conversation{} = conv}, :create, actor),
    do: handle_notify(ConversationCreated, conv, actor: actor)
  def notify({:ok, %Message{} = msg}, :create, actor),
    do: handle_notify(MessageCreated, msg, actor: actor)
  def notify({:ok, %Conversation{} = conv}, :update, actor),
    do: handle_notify(ConversationUpdated, conv, actor: actor)
  def notify(error, _, _), do: error
end