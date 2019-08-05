defmodule Core.Services.Conversations do
  use Core.Services.Base
  alias Core.PubSub
  alias Core.Services.{Messages, Users}
  alias Core.Models.{
    Conversation,
    Message,
    Participant,
    MessageEntity,
    User
  }
  import Core.Policies.Conversation

  def get_conversation!(id),
    do: Core.Repo.get!(Conversation, id)

  def get_conversation(id),
    do: Core.Repo.get(Conversation, id)

  def get_conversation_by_name(name),
    do: Core.Repo.get_by(Conversation, name: name)

  def get_participant(user_id, conv_id),
    do: Core.Repo.get_by(Participant, user_id: user_id, conversation_id: conv_id)

  def get_participant!(user_id, conv_id),
    do: Core.Repo.get_by!(Participant, user_id: user_id, conversation_id: conv_id)

  def authorize(conv_id, user, policy) do
    case get_conversation(conv_id) do
      %Conversation{} = conv -> allow(conv, user, policy)
      _ -> {:error, :not_found}
    end
  end

  def bump_last_seen(conversation_id, %User{id: uid} = user) do
    participant = get_participant(uid, conversation_id)

    case participant do
      %Participant{} = p -> p
      _ -> %Participant{conversation_id: conversation_id, user_id: uid}
    end
    |> Participant.changeset(%{last_seen_at: DateTime.utc_now()})
    |> Core.Repo.insert_or_update()
    |> notify(:upsert, user, participant)
  end

  def chat_name(users) do
    handles      = Enum.map(users, & &1.handle) |> Enum.sort()
    Enum.join(handles, " <> ")
  end

  def create_chat(user_id, %User{} = user) do
    other_user = Users.get_user!(user_id)
    chat_name  = chat_name([user, other_user])

    with {:ok, conv} <- upsert_conversation(chat_name, %{public: false}, user),
         {:ok, _}    <- bump_last_seen(conv.id, other_user),
      do: {:ok, conv}
  end

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

  def upsert_conversation(name, attrs, user) do
    conversation = get_conversation_by_name(name)

    start_transaction()
    |> add_operation(:conversation, fn _ ->
      case conversation do
        %Conversation{} = conv -> conv
        nil -> %Conversation{name: name}
      end
      |> Conversation.changeset(attrs)
      |> Core.Repo.insert_or_update()
    end)
    |> add_operation(:participant, fn %{conversation: conv} ->
      bump_last_seen(conv.id, user)
    end)
    |> execute(extract: :conversation)
    |> notify(:upsert, user, conversation)
  end

  def update_conversation(id, attrs, user) do
    get_conversation!(id)
    |> Conversation.changeset(attrs)
    |> allow(user, :update)
    |> when_ok(:update)
    |> notify(:update, user)
  end

  def delete_conversation(id, user) do
    get_conversation!(id)
    |> allow(user, :delete)
    |> when_ok(:delete)
    |> notify(:delete, user)
  end

  def update_participant(conv_id, user_id, attrs, user) do
    get_participant!(user_id, conv_id)
    |> Participant.changeset(attrs)
    |> allow(user, :update)
    |> when_ok(:update)
    |> notify(:update, user)
  end

  def create_message(conv_id, attrs, user) do
    start_transaction()
    |> add_operation(:message, fn _ ->
      %Message{conversation_id: conv_id, creator_id: user.id}
      |> Message.changeset(attrs)
      |> allow(user, :create)
      |> when_ok(:insert)
    end)
    |> add_operation(:inflated, fn %{message: %{text: text} = msg} ->
      with extracted when map_size(extracted) > 0 <- Messages.PostProcessor.extract_entities(text, user) do
        entities = for {_, {{pos, len}, user}} <- extracted do
          timestamped(%{
            user_id: user.id,
            type: :mention,
            start_index: pos,
            length: len,
            message_id: msg.id
          })
        end
        {_, entities} = Core.Repo.insert_all(MessageEntity, entities, returning: true)
        {:ok, %{msg | entities: entities}}
      else
        _ -> {:ok, %{msg | entities: []}}
      end
    end)
    |> execute(extract: :inflated)
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

  def notify({:ok, %Conversation{} = c}, :upsert, actor, nil),
    do: handle_notify(PubSub.ConversationCreated, c, actor: actor)
  def notify({:ok, %Conversation{} = c}, :upsert, actor, _),
    do: handle_notify(PubSub.ConversationUpdated, c, actor: actor)

  def notify({:ok, %Participant{} = p}, :upsert, actor, nil),
    do: handle_notify(PubSub.ParticipantCreated, p, actor: actor)
  def notify({:ok, %Participant{} = p}, :upsert, actor, _),
    do: handle_notify(PubSub.ParticipantUpdated, p, actor: actor)
  def notify(error, _, _, _), do: error

  def notify({:ok, %Conversation{} = conv}, :create, actor),
    do: handle_notify(PubSub.ConversationCreated, conv, actor: actor)
  def notify({:ok, %Message{} = msg}, :create, actor),
    do: handle_notify(PubSub.MessageCreated, msg, actor: actor)
  def notify({:ok, %Participant{} = part}, :create, actor),
    do: handle_notify(PubSub.ParticipantCreated, part, actor: actor)

  def notify({:ok, %Conversation{} = conv}, :update, actor),
    do: handle_notify(PubSub.ConversationUpdated, conv, actor: actor)

  def notify({:ok, %Conversation{} = conv}, :delete, actor),
    do: handle_notify(PubSub.ConversationDeleted, conv, actor: actor)
  def notify({:ok, %Participant{} = part}, :delete, actor),
    do: handle_notify(PubSub.ParticipantDeleted, part, actor: actor)
  def notify(error, _, _), do: error
end