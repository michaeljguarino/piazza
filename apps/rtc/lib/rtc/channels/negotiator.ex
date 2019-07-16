defprotocol Rtc.Channels.Negotiator do
  @fallback_to_any true
  def negotiate(event)
end

defimpl Rtc.Channels.Negotiator, for: Any do
  def negotiate(_), do: :ok
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.UserCreated do
  def negotiate(%{item: user}), do: {:new_users, user, "users"}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.UserUpdated do
  def negotiate(%{item: user}), do: {:updated_users, user, "users:#{user.id}"}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.ConversationCreated do
  def negotiate(%{item: conversation}), do: {:new_conversations, conversation, "conversations"}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.ConversationUpdated do
  def negotiate(%{item: conversation}), do: {:updated_conversations, conversation, "conversations:updated"}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.ConversationDeleted do
  def negotiate(%{item: conversation}), do: {:deleted_conversations, conversation, "conversations:deleted"}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.MessageCreated do
  def negotiate(%{item: message}), do: {:new_messages, message, "messages"}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.ParticipantCreated do
  def negotiate(%{item: %{conversation_id: id} = participant}), do: {:new_participants, participant, "participants:#{id}"}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.ParticipantDeleted do
  def negotiate(%{item: %{conversation_id: id} = participant}), do: {:deleted_participants, participant, "participants:#{id}"}
end