defmodule Core.Services.Conversations do
  use Core.Services.Base
  alias Core.PubSub
  alias Core.Services.{Messages, Users, Notifications}
  alias Core.Models.{
    Conversation,
    Message,
    Participant,
    MessageEntity,
    User,
    MessageReaction,
    PinnedMessage
  }
  import Core.Policies.Conversation

  def get_message!(id),
    do: Core.Repo.get!(Message, id)

  def get_conversation!(id),
    do: Core.Repo.get!(Conversation, id)

  def get_conversation(id),
    do: Core.Repo.get(Conversation, id)

  def get_conversation_by_name(name),
    do: Core.Repo.get_by(Conversation, name: name)

  def get_conversation_by_name!(name),
    do: Core.Repo.get_by!(Conversation, name: name)

  def get_conversation_by_dedupe_key(dedupe_key),
    do: Core.Repo.get_by(Conversation, chat_dedupe_key: dedupe_key)

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

  def bump_last_seen(conversation_id, user) do
    start_transaction()
    |> add_operation(:participant, fn _ ->
      upsert_participant(conversation_id, %{last_seen_at: DateTime.utc_now()}, user)
    end)
    |> add_operation(:notifs, fn _ ->
      Notifications.view_notifications(conversation_id, user)
    end)
    |> execute(extract: :participant)
  end

  def upsert_participant(conversation_id, attrs \\ %{}, %User{id: uid} = user) do
    participant = get_participant(uid, conversation_id)

    case participant do
      %Participant{} = p -> p
      _ -> %Participant{conversation_id: conversation_id, user_id: uid}
    end
    |> Participant.changeset(attrs)
    |> Ecto.Changeset.put_change(:deleted_at, nil)
    |> Core.Repo.insert_or_update()
    |> notify(:upsert, user, participant)
  end

  def create_chat(user_ids, %User{} = user) when is_list(user_ids) do
    other_users = Users.get_users_by_id(user_ids)
    chat_name  = chat_name([user | other_users])
    dedupe_key = chat_dedupe_key([user.id | user_ids])

    part_attrs = %{notification_preferences: %{message: true, mention: true}}
    start_transaction()
    |> add_operation(:conv, fn _ ->
      upsert_conversation(
        get_conversation_by_dedupe_key(dedupe_key),
        %{public: false, chat: true, name: chat_name, chat_dedupe_key: dedupe_key, participant: part_attrs},
        user
      )
    end)
    |> add_other_participants(other_users, part_attrs)
    |> execute(extract: :conv)
  end
  def create_chat(user_id, %User{} = user), do: create_chat([user_id], user)

  def chat_name(users) do
    Enum.map(users, & &1.handle)
    |> Enum.sort()
    |> Enum.join(", ")
  end

  defp chat_dedupe_key(user_ids) do
    # the choice of a chat dedupe key is to provide a stable
    # means of deduping even if a handle is updated (although that
    # is currently unsupported).
    user_ids
    |> Enum.sort()
    |> Enum.join("::")
  end

  defp add_other_participants(transaction, users, part_attrs) do
    Enum.reduce(users, transaction, fn user, transaction ->
      add_operation(transaction, {:participant, user.id}, fn %{conv: conv} ->
        upsert_participant(conv.id, part_attrs, user)
      end)
    end)
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

  def upsert_conversation(name, attrs, user) when is_binary(name),
    do: get_conversation_by_name(name) |> upsert_conversation(attrs, user)
  def upsert_conversation(conversation, attrs, user) do
    attrs = Map.put_new(attrs, :participant, %{})

    start_transaction()
    |> add_operation(:conversation, fn _ ->
      case conversation do
        %Conversation{} = conv -> conv
        nil -> %Conversation{}
      end
      |> Conversation.changeset(attrs)
      |> Core.Repo.insert_or_update()
    end)
    |> add_operation(:participant, fn %{conversation: conv} ->
      upsert_participant(conv.id, Map.put(attrs.participant, :last_seen_at, DateTime.utc_now()), user)
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
      with [_ | _] = entities <- Messages.PostProcessor.extract_entities(text, user) do
        entities = Enum.map(entities, &Map.put(&1, :message_id, msg.id))
        {_, entities} = Core.Repo.insert_all(MessageEntity, entities, returning: true)
        {:ok, %{msg | entities: entities}}
      else
        _ -> {:ok, %{msg | entities: []}}
      end
    end)
    |> add_operation(:parent, fn %{message: msg} ->
      Core.Repo.preload(msg, [:parent])
      |> Map.get(:parent)
      |> case do
        nil -> {:ok, msg}
        msg -> Core.Repo.increment(msg, :reply_count)
      end
    end)
    |> execute(extract: :inflated)
    |> notify(:create, user)
  end

  def toggle_pin(message_id, pinned \\ true, user) do
    start_transaction()
    |> add_operation(:message, fn _ ->
      get_message!(message_id)
      |> Ecto.Changeset.change(%{pinned_at: (if !!pinned, do: DateTime.utc_now(), else: nil)})
      |> allow(user, :edit)
      |> when_ok(:update)
    end)
    |> add_operation(:pinned_message, fn %{message: message} ->
      do_toggle_pin(message, pinned, user)
    end)
    |> add_operation(:conversation, fn %{message: %{conversation_id: id, pinned_at: pinned}} ->
      inc = if !!pinned, do: 1, else: -1

      {_, [conv]} =
        Conversation.for_id(id)
        |> Conversation.increment_pinned_messages(inc)
        |> Conversation.selected()
        |> Core.Repo.update_all([])

      {:ok, conv}
    end)
    |> execute()
    |> case do
      {:ok, %{pinned_message: pin, message: message}} ->
        notify({:ok, message}, :update, user)
        notify({:ok, pin}, (if !!pinned, do: :create, else: :delete), user)
      error -> error
    end
  end

  def do_toggle_pin(message, true, user) do
    %PinnedMessage{user_id: user.id}
    |> PinnedMessage.changeset(%{
      message_id: message.id,
      conversation_id: message.conversation_id
    })
    |> Core.Repo.insert()
  end
  def do_toggle_pin(message, _, _user) do
    Core.Repo.get_by!(PinnedMessage,
      message_id: message.id, conversation_id: message.conversation_id)
    |> Core.Repo.delete()
  end

  def create_reaction(message_id, name, user) do
    start_transaction()
    |> add_operation(:allow, fn _ ->
      get_message!(message_id)
      |> allow(user, :edit)
    end)
    |> add_operation(:reaction, fn _ ->
      %MessageReaction{user_id: user.id}
      |> MessageReaction.changeset(%{message_id: message_id, name: name})
      |> Core.Repo.insert(
        on_conflict: :replace_all_except_primary_key,
        conflict_target: [:name, :message_id, :user_id]
      )
    end)
    |> execute(extract: :allow)
    |> notify(:update, user)
  end

  def delete_reaction(message_id, name, user) do
    start_transaction()
    |> add_operation(:reaction, fn _ ->
      Core.Repo.get_by!(MessageReaction,
        message_id: message_id, name: name, user_id: user.id)
      |> Core.Repo.delete()
    end)
    |> add_operation(:msg, fn _ ->
      {:ok, get_message!(message_id)}
    end)
    |> execute(extract: :msg)
    |> notify(:update, user)
  end

  def delete_message(message_id, user) do
    get_message!(message_id)
    |> allow(user, :delete)
    |> when_ok(:delete)
    |> notify(:delete, user)
  end

  def create_participant(attrs, user) do
    %Participant{}
    |> Participant.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
    |> notify(:create, user)
  end

  def create_participants(handles, conversation_id, user) do
    conversation = get_conversation!(conversation_id)
    with handles when length(handles) < 10 <- handles,
         {:ok, _} <- allow(conversation, user, :update) do
      models =
        Users.get_users_by_handles(handles)
        |> Enum.map(fn user ->
          timestamped(%{user_id: user.id, conversation_id: conversation_id})
        end)

      {_, results} = Core.Repo.insert_all(
        Participant,
        models,
        returning: true,
        on_conflict: :replace_all_except_primary_key,
        conflict_target: [:conversation_id, :user_id]
      )
      Enum.each(results, &handle_notify(PubSub.ParticipantCreated, &1, actor: user))
      {:ok, results}
    else
      handles when is_list(handles) -> {:error, "Can only proved < 10 handles"}
      {:error, _} = error -> error
    end
  end

  def delete_participant(conv_id, user_id, user) do
    get_participant!(user_id, conv_id)
    |> Core.Repo.preload([:conversation])
    |> handle_delete_participant(user)
  end

  defp handle_delete_participant(
    %Participant{user_id: uid, conversation: %{chat: true}} = participant, 
    %User{id: uid}
  ) do
    participant
    |> Ecto.Changeset.change(%{deleted_at: DateTime.utc_now()})
    |> Core.Repo.update()
  end
  defp handle_delete_participant(participant, user) do
    participant
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
  def notify({:ok, %Participant{} = p}, :upsert, actor, %Participant{deleted_at: del})
      when not is_nil(del), do: handle_notify(PubSub.ParticipantCreated, p, actor: actor)
  def notify({:ok, %Participant{} = p}, :upsert, actor, _),
    do: handle_notify(PubSub.ParticipantUpdated, p, actor: actor)
  def notify(error, _, _, _), do: error

  def notify({:ok, %Conversation{} = conv}, :create, actor),
    do: handle_notify(PubSub.ConversationCreated, conv, actor: actor)
  def notify({:ok, %Message{} = msg}, :create, actor),
    do: handle_notify(PubSub.MessageCreated, msg, actor: actor)
  def notify({:ok, %Participant{} = part}, :create, actor),
    do: handle_notify(PubSub.ParticipantCreated, part, actor: actor)
  def notify({:ok, %PinnedMessage{} = pin}, :create, actor),
    do: handle_notify(PubSub.PinnedMessageCreated, pin, actor: actor)

  def notify({:ok, %Conversation{} = conv}, :update, actor),
    do: handle_notify(PubSub.ConversationUpdated, conv, actor: actor)
  def notify({:ok, %Message{} = msg}, :update, actor),
    do: handle_notify(PubSub.MessageUpdated, msg, actor: actor)

  def notify({:ok, %Conversation{} = conv}, :delete, actor),
    do: handle_notify(PubSub.ConversationDeleted, conv, actor: actor)
  def notify({:ok, %Participant{} = part}, :delete, actor),
    do: handle_notify(PubSub.ParticipantDeleted, part, actor: actor)
  def notify({:ok, %Message{} = msg}, :delete, actor),
    do: handle_notify(PubSub.MessageDeleted, msg, actor: actor)
  def notify({:ok, %PinnedMessage{} = pin}, :delete, actor),
    do: handle_notify(PubSub.PinnedMessageDeleted, pin, actor: actor)
  def notify(error, _, _), do: error
end