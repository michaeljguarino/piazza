defprotocol Core.PubSub.Realtime do
  @fallback_to_any true
  def publish?(event)
end

defimpl Core.PubSub.Realtime, for: Any do
  def publish?(_), do: false
end

defimpl Core.PubSub.Realtime, for: [
  Core.PubSub.UserCreated,
  Core.PubSub.UserUpdated,
  Core.PubSub.ConversationCreated,
  Core.PubSub.ConversationUpdated,
  Core.PubSub.ConversationDeleted,
  Core.PubSub.MessageCreated,
  Core.PubSub.MessageFanout,
  Core.PubSub.MessageDeleted,
  Core.PubSub.MessageUpdated,
  Core.PubSub.ParticipantCreated,
  Core.PubSub.ParticipantDeleted,
  Core.PubSub.ParticipantUpdated,
  Core.PubSub.NotificationCreated,
  Core.PubSub.PinnedMessageCreated,
  Core.PubSub.PinnedMessageDeleted,
  Core.PubSub.CommandCreated,
  Core.PubSub.CommandUpdated,
  Core.PubSub.EmojiCreated,
  Core.PubSub.DialogCreated
] do
  def publish?(_), do: true
end
