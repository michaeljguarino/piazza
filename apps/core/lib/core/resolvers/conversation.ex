defmodule Core.Resolvers.Conversation do
  use Core.Resolvers.Base, model: Core.Models.Conversation
  alias Core.Services.Conversations
  alias Core.Models.{
    Message,
    Participant,
    MessageEntity,
    MessageReaction,
    PinnedMessage
  }

  def data(args),
    do: Dataloader.Ecto.new(Core.Repo, query: &query/2, default_params: filter_context(args), run_batch: &run_batch/5)

  def query(Message, _args), do: Message
  def query(Participant, %{current_user: user}), do: Participant.for_user(user.id)
  def query(Conversation, _args), do: Conversation
  def query(MessageEntity, _args), do: MessageEntity
  def query(MessageReaction, _args), do: MessageReaction
  def query(PinnedMessage, _args), do: PinnedMessage
  def query(:unread_messages, _), do: Conversation.any()
  def query(:unread_notifications, _), do: Conversation.any()

  def query(_, %{chat: true, current_user: user}) do
    Conversation.chat()
    |> Conversation.for_user(user.id)
  end
  def query(_, %{public: true, current_user: user}) do
    Conversation.public()
    |> Conversation.nonchat()
    |> Conversation.for_user(user.id)
  end
  def query(_, %{public: false, current_user: user}) do
    Conversation.for_user(user.id)
    |> Conversation.nonchat()
    |> Conversation.private()
  end
  def query(_, %{current_user: user}) do
    Conversation.nonchat()
    |> Conversation.for_user(user.id)
  end

  def run_batch(_, _, :unread_notifications, args, repo_opts) do
    [{%{id: user_id}, _} | _] = args
    conversation_ids = Enum.map(args, fn {_, %{id: id}} -> id end)
    result =
      Conversation.for_ids(conversation_ids)
      |> Conversation.unread_notification_count(user_id)
      |> Core.Repo.all(repo_opts)
      |> Map.new()

    Enum.map(conversation_ids, & [Map.get(result, &1, 0)])
  end
  def run_batch(_, _, :unread_messages, args, repo_opts) do
    [{%{id: user_id}, _} | _] = args
    conversation_ids = Enum.map(args, fn {_, %{id: id}} -> id end)
    result =
      Conversation.for_ids(conversation_ids)
      |> Conversation.unread_message_count(user_id)
      |> Core.Repo.all(repo_opts)
      |> Map.new()

    Enum.map(conversation_ids, & [Map.get(result, &1, 0)])
  end
  def run_batch(_, _, :pinned_message_count, args, repo_opts) do
    conversation_ids = Enum.map(args, fn %{id: id} -> id end)
    result =
      Conversation.for_ids(conversation_ids)
      |> Conversation.pinned_message_count()
      |> Core.Repo.all(repo_opts)
      |> Map.new()

    Enum.map(conversation_ids, & [Map.get(result, &1, 0)])
  end
  def run_batch(_, _, :participant_count, args, repo_opts) do
    conversation_ids = Enum.map(args, fn %{id: id} -> id end)
    result =
      Conversation.for_ids(conversation_ids)
      |> Conversation.participant_count()
      |> Core.Repo.all(repo_opts)
      |> Map.new()

    Enum.map(conversation_ids, & [Map.get(result, &1, 0)])
  end
  def run_batch(_, _, :chat_participants, args, repo_opts) do
    # we can't use a standard ecto association here because it
    # only supports filtering on the associated record, not source
    conversation_ids = Enum.filter(args, & &1.chat) |> Enum.map(& &1.id)

    if !Enum.empty?(conversation_ids) do
      grouped_result =
        Participant.for_conversations(conversation_ids)
        |> Core.Repo.all(repo_opts)
        |> Enum.group_by(& &1.conversation_id)

      Enum.map(args, &Map.get(grouped_result, &1.id, []))
    else
      Enum.map(args, fn _ -> [] end)
    end
  end
  def run_batch(queryable, query, col, inputs, repo_opts) do
    Dataloader.Ecto.run_batch(Core.Repo, queryable, query, col, inputs, repo_opts)
  end

  def resolve_conversation(_parent, %{id: id}, %{context: %{current_user: user}}),
    do: {:ok, Conversation.accessible(user.id) |> Core.Repo.get(id)}
  def resolve_conversation(_, %{name: name}, %{context: %{current_user: user}}),
    do: {:ok, Conversation.accessible(user.id) |> Core.Repo.get_by(name: name)}

  def authorize_subscription(conversation_id, current_user, topic) do
    with %Conversation{} = conv <- Conversations.get_conversation(conversation_id),
         {:ok, _} <- Core.Policies.Conversation.allow(conv, current_user, :access) do
      {:ok, topic: topic}
    else
      _ -> {:error, :forbidden}
    end
  end

  def list_conversations(args, %{context: context}) do
    query(:conversation, Map.merge(args, context))
    |> Conversation.ordered()
    |> paginate(args)
  end

  def search_conversations(%{name: name} = args, %{context: %{current_user: user}}) do
    Conversation.accessible(user.id)
    |> Conversation.search(name)
    |> paginate(args)
  end

  def list_messages(args, %{source: conversation}) do
    Message.for_conversation(conversation.id)
    |> with_anchor(args)
    |> order(args)
    |> paginate(args)
  end

  defp with_anchor(query, %{anchor: anchor, direction: direction}),
    do: Message.with_anchor(query, anchor, direction)
  defp with_anchor(query, _), do: query

  defp order(query, %{anchor: _, direction: _}), do: query
  defp order(query, _), do: Message.ordered(query)

  def list_pinned_messages(args, %{source: conversation}) do
    PinnedMessage.for_conversation(conversation.id)
    |> PinnedMessage.ordered()
    |> paginate(args)
  end

  def search_messages(%{query: query} = args, %{source: conversation}) do
    Message.any()
    |> Message.for_conversation(conversation.id)
    |> Message.search(query)
    |> paginate(args)
  end

  def list_participants(args, %{source: conversation}) do
    Participant.for_conversation(conversation.id)
    |> paginate(args)
  end

  def create_conversation(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Conversations.create_conversation(attrs, user)

  def create_chat(%{user_id: user_id}, %{context: %{current_user: user}}),
    do: Conversations.create_chat(user_id, user)
  def create_chat(%{user_ids: user_ids}, %{context: %{current_user: user}}),
    do: Conversations.create_chat(user_ids, user)

  def update_conversation(%{id: id, attributes: attrs}, %{context: %{current_user: user}}),
    do: Conversations.update_conversation(id, attrs, user)

  def delete_conversation(%{id: id}, %{context: %{current_user: user}}),
    do: Conversations.delete_conversation(id, user)

  def create_message(%{conversation_id: conv_id, attributes: attrs}, %{context: %{current_user: user}}),
    do: Conversations.create_message(conv_id, attrs, user)

  def pin_message(%{message_id: msg_id, pinned: pinned}, %{context: %{current_user: user}}),
    do: Conversations.toggle_pin(msg_id, pinned, user)

  def delete_message(%{message_id: msg_id}, %{context: %{current_user: user}}),
    do: Conversations.delete_message(msg_id, user)

  def create_reaction(%{message_id: msg_id, name: name}, %{context: %{current_user: user}}),
    do: Conversations.create_reaction(msg_id, name, user)

  def delete_reaction(%{message_id: msg_id, name: name}, %{context: %{current_user: user}}),
    do: Conversations.delete_reaction(msg_id, name, user)

  def create_participant(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Conversations.create_participant(attrs, user)

  def create_participants(%{handles: handles, conversation_id: conv_id}, %{context: %{current_user: user}}),
    do: Conversations.create_participants(handles, conv_id, user)

  def delete_participant(%{conversation_id: cid, user_id: uid}, %{context: %{current_user: user}}),
    do: Conversations.delete_participant(cid, uid, user)

  def update_participant(%{
    conversation_id: cid,
    user_id: uid,
    notification_preferences: prefs
  }, %{context: %{current_user: user}}) do
    Conversations.update_participant(cid, uid, %{notification_preferences: prefs}, user)
  end
end