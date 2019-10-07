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
    PinnedMessage,
    Dialog,
    File
  }
  import Core.Policies.Conversation

  @type conversation_resp :: {:ok, Conversation.t} | error
  @type msg_resp :: {:ok, Message.t} | error
  @type participant_resp :: {:ok, Participant.t} | error

  @spec get_message!(binary) :: Message.t
  def get_message!(id),
    do: Core.Repo.get!(Message, id)

  @spec get_conversation!(binary) :: Conversation.t
  def get_conversation!(id),
    do: Core.Repo.get!(Conversation, id)

  @spec get_conversation(binary) :: Conversation.t | nil
  def get_conversation(id),
    do: Core.Repo.get(Conversation, id)

  @spec get_conversation_by_name(binary) :: Conversation.t | nil
  def get_conversation_by_name(name),
    do: Core.Repo.get_by(Conversation, name: name)

  @spec get_conversation_by_name!(binary) :: Conversation.t
  def get_conversation_by_name!(name),
    do: Core.Repo.get_by!(Conversation, name: name)

  @spec get_conversation_by_dedupe_key(binary) :: Conversation.t | nil
  def get_conversation_by_dedupe_key(dedupe_key),
    do: Core.Repo.get_by(Conversation, chat_dedupe_key: dedupe_key)

  @spec get_participant(binary, binary) :: Participant.t | nil
  def get_participant(user_id, conv_id),
    do: Core.Repo.get_by(Participant, user_id: user_id, conversation_id: conv_id)

  @spec get_participant!(binary, binary) :: Participant.t
  def get_participant!(user_id, conv_id),
    do: Core.Repo.get_by!(Participant, user_id: user_id, conversation_id: conv_id)

  @doc """
  Tests if the user can perform a given action in a conversation, returns
  a tag tuple for the result for chaining
  """
  @spec authorize(binary, User.t, atom) :: {:ok, Conversation.t} | {:error, :not_found}
  def authorize(conv_id, user, policy) do
    case get_conversation(conv_id) do
      %Conversation{} = conv -> allow(conv, user, policy)
      _ -> {:error, :not_found}
    end
  end

  @doc """
  Updates the last_seen_at timestamp on the participant for a conversation (and
  alternatively creates the participant if soft-deleted/not present)

  Also wipes all notifications for this conversation
  """
  @spec bump_last_seen(binary, User.t) :: participant_resp
  def bump_last_seen(conversation_id, user) do
    start_transaction()
    |> add_operation(:participant, fn _ ->
      upsert_participant(
        conversation_id,
        %{last_seen_at: DateTime.utc_now()},
        user
      )
    end)
    |> add_operation(:notifs, fn _ ->
      Notifications.view_notifications(conversation_id, user)
    end)
    |> execute(extract: :participant)
  end

  @doc """
  Upserts a participant in `conversation_id` against the given user,
  with attrs merged in.  Useful for bumping timestamps/bulk inserts
  """
  @spec upsert_participant(binary, map, User.t) :: participant_resp
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

  @doc """
  Creates a new chat styled conversation with user and the given user ids
  """
  @spec create_chat([binary], User.t) :: conversation_resp
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

  @doc """
  Gets the canonical chat name given a set of users
  """
  @spec chat_name([User.t]) :: binary
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

  @doc """
  Creates a new conversation with the given attrs.  Also adds a default
  participant for the creator

  Allowed roles:
  * all
  """
  @spec create_conversation(map, User.t) :: conversation_resp
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

  @doc """
  Utility for conversation upserts,
  """
  @spec upsert_conversation(binary, map, User.t) :: conversation_resp
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

  @doc """
  Gets a (cached) view of all participants.  If the list is too large for cache,
  the response will be a stream
  """
  @spec get_participants(binary) :: [Participant.t] | %Bourne.Stream{}
  def get_participants(conversation_id) do
    Participant.for_conversation(conversation_id)
    |> Participant.preload([:user])
    |> Participant.ordered()
    |> Core.Cache.list_cache(:participants, conversation_id)
  end

  @doc """
  Updates the conversation by id

  allowed roles:
  - participant
  - admin
  """
  @spec update_conversation(binary, map, User.t) :: conversation_resp
  def update_conversation(id, attrs, user) do
    get_conversation!(id)
    |> Conversation.changeset(attrs)
    |> allow(user, :update)
    |> when_ok(:update)
    |> notify(:update, user)
  end

  @doc """
  Deletes a conversation

  allowed roles:
  * participant
  * admin
  """
  @spec delete_conversation(binary, User.t) :: conversation_resp
  def delete_conversation(id, user) do
    get_conversation!(id)
    |> allow(user, :delete)
    |> when_ok(:delete)
    |> notify(:delete, user)
  end

  @doc """
  Updates participant attrs for `user_id` in `conv_id`

  allowed roles:
  * self
  * admin
  """
  @spec update_participant(binary, binary, map, User.t) :: participant_resp
  def update_participant(conv_id, user_id, attrs, user) do
    get_participant!(user_id, conv_id)
    |> Participant.changeset(attrs)
    |> allow(user, :update)
    |> when_ok(:update)
    |> notify(:update, user)
  end

  @doc """
  Updates a given message.

  allowed roles:
  * creator
  """
  @spec update_message(binary, map, User.t) :: msg_resp
  def update_message(message_id, attrs, user) do
    get_message!(message_id)
    |> Message.changeset(attrs)
    |> allow(user, :update)
    |> when_ok(:update)
    |> notify(:update, user)
  end

  @doc """
  Creates a new message

  allowed roles:
  * participant
  * bot
  """
  @spec create_message(binary, map, User.t) :: msg_resp
  def create_message(conv_id, attrs, user) do
    start_transaction()
    |> add_operation(:message, fn _ ->
      %Message{conversation_id: conv_id, creator_id: user.id}
      |> Message.changeset(attrs)
      |> allow(user, :create)
      |> when_ok(:insert)
    end)
    |> add_operation(:file, fn %{message: message} ->
      maybe_create_file(attrs, message)
    end)
    |> add_operation(:inflated, fn %{message: %{text: text} = msg, file: file} ->
      with [_ | _] = entities <- Messages.PostProcessor.extract_entities(text, user) do
        entities = Enum.map(entities, &Map.put(&1, :message_id, msg.id))
        {_, entities} = Core.Repo.insert_all(MessageEntity, entities, returning: true)
        {:ok, %{msg | entities: entities, file: file}}
      else
        _ -> {:ok, %{msg | entities: [], file: file}}
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

  @doc """
  Creates a new file for a message
  """
  @spec create_file(binary | Plug.Upload.t, Message.t) :: {:ok, File.t} | error
  def create_file(attachment, %Message{id: id}) do
    %File{message_id: id}
    |> File.changeset(%{object: attachment})
    |> Core.Repo.insert()
  end

  defp maybe_create_file(%{attachment: attachment}, message) when is_binary(attachment),
    do: create_file(attachment, message)
  defp maybe_create_file(%{attachment: %Plug.Upload{} = attachment}, message),
    do: create_file(attachment, message)
  defp maybe_create_file(_, _), do: {:ok, nil}

  @doc """
  Adds/removes a given pinned message for `message_id`

  allowed roles:
  * participant
  """
  @spec toggle_pin(binary, boolean, User.t) :: {:ok, PinnedMessage.t} | error
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

  defp do_toggle_pin(message, true, user) do
    %PinnedMessage{user_id: user.id}
    |> PinnedMessage.changeset(%{
      message_id: message.id,
      conversation_id: message.conversation_id
    })
    |> Core.Repo.insert()
  end
  defp do_toggle_pin(message, _, _user) do
    Core.Repo.get_by!(PinnedMessage,
      message_id: message.id, conversation_id: message.conversation_id)
    |> Core.Repo.delete()
  end

  @doc """
  Creates a new MessageReaction record for `message_id`

  Allowed roles:
  * participant
  """
  @spec create_reaction(binary, binary, User.t) :: {:ok, MessageReaction.t} | error
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

  @doc """
  Removes the message reaction against `name`

  allowed roles:
  * creator
  """
  @spec delete_reaction(binary, binary, User.t) :: {:ok, MessageReaction.t} | error
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

  @doc """
  Deletes a message

  allowed roles:
  * creator
  """
  @spec delete_message(binary, User.t) :: msg_resp
  def delete_message(message_id, user) do
    get_message!(message_id)
    |> allow(user, :delete)
    |> when_ok(:delete)
    |> notify(:delete, user)
  end

  @doc """
  Creates a new participant in a conversation

  allowed roles:
  * participant
  """
  @spec create_participant(map, User.t) :: participant_resp
  def create_participant(attrs, user) do
    %Participant{}
    |> Participant.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
    |> notify(:create, user)
  end

  @doc """
  Creates participants for all users with the given handles (max 10)

  allowed roles:
  * participant
  """
  @spec create_participants([binary], binary, User.t) :: {:ok, [Participant.t]} | error
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

  @doc """
  Deletes a participant record if found.  Interesting caveat, chat participants
  are not hard deleted as we want to wake them back up on new messages.

  allowed roles:
  * self
  """
  @spec delete_participant(binary, binary, User.t) :: participant_resp
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

  @doc """
  Issues a dialog anchored to the given message
  """
  @spec create_dialog(binary | map, Message.t, User.t) :: {:ok, Dialog.t} | error
  def create_dialog(message, anchor, user) do
    with {:ok, dialog} <- Dialog.build_dialog(message, anchor, user),
      do: handle_notify(PubSub.DialogCreated, dialog, actor: user)
  end

  @doc """
  notify is opened up in this service for reuse in pubsub handlers
  """
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