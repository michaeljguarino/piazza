defmodule Core.Services.Conversations do
  use Core.Services.Base
  alias Core.Models.{Conversation, Message, Participant}
  alias Core.PubSub
  import Core.Policies.Conversation

  def get_conversation!(id), do: Core.Repo.get!(Conversation, id)

  def get_conversation(id), do: Core.Repo.get(Conversation, id)

  def get_conversation_by_name(name), do: Core.Repo.get_by(Conversation, name: name)

  def get_participant(user_id, conv_id),
    do: Core.Repo.get_by(Participant, user_id: user_id, conversation_id: conv_id)

  def get_participant!(user_id, conv_id),
    do: Core.Repo.get_by!(Participant, user_id: user_id, conversation_id: conv_id)

  def create_conversation(attrs, user) do
    start_transaction()
    |> add_operation(:conversation, fn _ ->
      %Conversation{creator_id: user.id}
      |> Conversation.changeset(attrs)
      |> allow(user, :create)
      |> when_ok(:insert)
    end)
    |> add_operation(:participant, fn %{conversation: conv} ->
      %Participant{}
      |> Participant.changeset(%{conversation_id: conv.id, user_id: user.id})
      |> Core.Repo.insert()
    end)
    |> execute(extract: :conversation)
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

  def create_participant(attrs, user) do
    %Participant{}
    |> Participant.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
    |> notify(:create, user)
  end

  def delete_participant(conv_id, user_id, user) do
    get_participant!(user_id, conv_id)
    |> allow(user, :delete)
    |> when_ok(:delete)
    |> notify(:delete, user)
  end

  def notify({:ok, %Conversation{} = conv}, :create, actor),
    do: handle_notify(PubSub.ConversationCreated, conv, actor: actor)
  def notify({:ok, %Message{} = msg}, :create, actor),
    do: handle_notify(PubSub.MessageCreated, msg, actor: actor)
  def notify({:ok, %Participant{} = part}, :create, actor),
    do: handle_notify(PubSub.ParticipantCreated, part, actor: actor)

  def notify({:ok, %Conversation{} = conv}, :update, actor),
    do: handle_notify(PubSub.ConversationUpdated, conv, actor: actor)

  def notify({:ok, %Participant{} = part}, :delete, actor),
    do: handle_notify(PubSub.ParticipantDeleted, part, actor: actor)
  def notify(error, _, _), do: error
end