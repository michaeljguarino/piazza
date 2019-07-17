defprotocol Rtc.Channels.Negotiator do
  @fallback_to_any true
  def negotiate(event)
end

defimpl Rtc.Channels.Negotiator, for: Any do
  def negotiate(_), do: :ok
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.UserCreated do
  def negotiate(%{item: user}), do: {user, [new_users: "users"]}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.UserUpdated do
  def negotiate(%{item: user}), do: {user, [updated_users: "users:#{user.id}"]}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.ConversationCreated do
  def negotiate(%{item: %{public: true} = conversation}),
    do: {conversation, [new_conversations: "conversations"]}
  def negotiate(_), do: :ok
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.ConversationUpdated do
  def negotiate(%{item: %{id: id} = conversation}),
    do: {conversation, [updated_conversations: "conversations:#{id}"]}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.ConversationDeleted do
  def negotiate(%{item: %{public: true, id: id} = conv}),
    do: {conv, [deleted_conversations: "conversations:#{id}", deleted_conversations: "conversations:deleted"]}
  def negotiate(%{item: %{id: id} = conversation}),
    do: {conversation, [deleted_conversations: "conversations:#{id}"]}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.MessageCreated do
  def negotiate(%{item: %{conversation_id: id} = message}),
    do: {message, [new_messages: "messages:#{id}"]}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.ParticipantCreated do
  def negotiate(%{item: %{conversation_id: id, user_id: uid} = participant}),
    do: {participant, [new_participants: "participants:#{id}", my_participants: "participants:mine:#{uid}"]}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.ParticipantDeleted do
  def negotiate(%{item: %{conversation_id: id} = participant}),
    do: {participant, [deleted_participants: "participants:#{id}"]}
end