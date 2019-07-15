defmodule Core.Resolvers.Conversation do
  use Core.Resolvers.Base, model: Core.Models.Conversation
  alias Core.Services.Conversations
  alias Core.Models.{Message, Participant}

  def query(Message, _args), do: Message
  def query(Participant, _args), do: Participant
  def query(Conversation, _args), do: Conversation

  def query(_, %{public: true}), do: Conversation.public()
  def query(_, %{public: false, current_user: user}) do
    Conversation.for_user(user.id)
    |> Conversation.private()
  end
  def query(_, %{current_user: user}), do: Conversation.for_user(user.id)

  def resolve_conversation(_parent, %{id: id}, %{current_user: user}),
    do: {:ok, Conversation.for_user(user.id) |> Core.Repo.get(id)}
  def resolve_conversation(_parent, %{id: id}, _),
    do: {:ok, Conversation.public() |> Core.Repo.get(id)}

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

  def create_message(%{conversation_id: conv_id, attributes: attrs}, %{context: %{current_user: user}}),
    do: Conversations.create_message(conv_id, attrs, user)

  def create_participant(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Conversations.create_participant(attrs, user)

  def delete_participant(%{conversation_id: cid, user_id: uid}, %{context: %{current_user: user}}),
    do: Conversations.delete_participant(cid, uid, user)
end