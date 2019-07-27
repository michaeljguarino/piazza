defmodule Core.Resolvers.Conversation do
  use Core.Resolvers.Base, model: Core.Models.Conversation
  alias Core.Services.Conversations
  alias Core.Models.{Message, Participant, MessageEntity}

  def query(Message, _args), do: Message
  def query(Participant, _args), do: Participant
  def query(Conversation, _args), do: Conversation
  def query(MessageEntity, _args), do: MessageEntity

  def query(_, %{public: true}), do: Conversation.public()
  def query(_, %{public: false, current_user: user}) do
    Conversation.for_user(user.id)
    |> Conversation.private()
  end
  def query(_, %{current_user: user}), do: Conversation.for_user(user.id)

  def resolve_conversation(_parent, %{id: id}, %{context: %{current_user: user}}),
    do: {:ok, Conversation.for_user(user.id) |> Core.Repo.get(id)}
  def resolve_conversation(_, %{name: name}, %{context: %{current_user: user}}),
    do: {:ok, Conversation.for_user(user.id) |> Core.Repo.get_by(name: name)}

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
    |> paginate(args)
  end

  def list_messages(args, %{source: conversation}) do
    Message.any()
    |> Message.for_conversation(conversation.id)
    |> paginate(args)
  end

  def list_participants(args, %{source: conversation}) do
    Participant.for_conversation(conversation.id)
    |> paginate(args)
  end

  def create_conversation(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Conversations.create_conversation(attrs, user)

  def update_conversation(%{id: id, attributes: attrs}, %{context: %{current_user: user}}),
    do: Conversations.update_conversation(id, attrs, user)

  def delete_conversation(%{id: id}, %{context: %{current_user: user}}),
    do: Conversations.delete_conversation(id, user)

  def create_message(%{conversation_id: conv_id, attributes: attrs}, %{context: %{current_user: user}}),
    do: Conversations.create_message(conv_id, attrs, user)

  def create_participant(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Conversations.create_participant(attrs, user)

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