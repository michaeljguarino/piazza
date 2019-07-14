defmodule Core.Resolvers.Conversation do
  use Core.Resolvers.Base, model: Core.Models.Conversation
  alias Core.Models.Message
  alias Core.Models.Participant

  def query(Message, _args), do: Message.any()
  def query(Participant, _args), do: Participant.any()

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
    Message.for_conversation(conversation.id)
    |> paginate(args)
  end

  def list_participants(args, %{source: conversation}) do
    Participant.for_conversation(conversation.id)
    |> paginate(args)
  end
end