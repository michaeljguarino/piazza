defprotocol Rtc.Channels.Negotiator do
  @fallback_to_any true

  @doc """
  Returns the payload and topics for a graphql subscription event
  """
  @spec negotiate(term) :: {map, keyword}
  def negotiate(event)
end

defmodule Rtc.Channels.NegotiatorHelper do
  def delta(payload, delta) do
    %{delta: delta, payload: payload}
  end
end

defimpl Rtc.Channels.Negotiator, for: Any do
  def negotiate(_), do: :ok
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.UserCreated do
  import Rtc.Channels.NegotiatorHelper

  def negotiate(%{item: user}), do: {delta(user, :create), [user_delta: "users"]}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.UserUpdated do
  import Rtc.Channels.NegotiatorHelper

  def negotiate(%{item: user}), do: {delta(user, :update), [user_delta: "users"]}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.ConversationUpdated do
  import Rtc.Channels.NegotiatorHelper

  def negotiate(%{item: %{id: id} = conversation}),
    do: {delta(conversation, :update), [conversation_delta: "conversations:#{id}"]}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.ConversationDeleted do
  import Rtc.Channels.NegotiatorHelper

  def negotiate(%{item: %{id: id} = conversation}),
    do: {delta(conversation, :delete), [conversation_delta: "conversations:#{id}"]}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.MessageCreated do
  import Rtc.Channels.NegotiatorHelper

  def negotiate(%{item: %{conversation_id: id} = message}),
    do: {delta(message, :create), [message_delta: "messages:#{id}"]}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.MessageDeleted do
  import Rtc.Channels.NegotiatorHelper

  def negotiate(%{item: %{conversation_id: id} = message}),
    do: {delta(message, :delete), [message_delta: "messages:#{id}"]}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.MessageUpdated do
  import Rtc.Channels.NegotiatorHelper

  def negotiate(%{item: %{conversation_id: id} = message}),
    do: {delta(message, :update), [message_delta: "messages:#{id}"]}
end


defimpl Rtc.Channels.Negotiator, for: Core.PubSub.MessageFanout do
  import Rtc.Channels.NegotiatorHelper
  alias Core.PubSub

  def negotiate(%{item: message, user: %{id: uid}, delta: event}),
    do: {delta(message, to_delta(event)), [message_delta: "messages:user:#{uid}"]}

  defp to_delta(PubSub.MessageCreated), do: :create
  defp to_delta(PubSub.MessageUpdated), do: :update
  defp to_delta(PubSub.MessageDeleted), do: :delete
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.PinnedMessageDeleted do
  import Rtc.Channels.NegotiatorHelper

  def negotiate(%{item: %{conversation_id: id} = pin}),
    do: {delta(pin, :delete), [pinned_message_delta: "pinned_messages:#{id}"]}
end


defimpl Rtc.Channels.Negotiator, for: Core.PubSub.PinnedMessageCreated do
  import Rtc.Channels.NegotiatorHelper

  def negotiate(%{item: %{conversation_id: id} = pin}),
    do: {delta(pin, :create), [pinned_message_delta: "pinned_messages:#{id}"]}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.ParticipantCreated do
  import Rtc.Channels.NegotiatorHelper

  def negotiate(%{item: %{conversation_id: id, user_id: uid} = participant}) do
    {delta(participant, :create),
     [participant_delta: "participants:#{id}", participant_delta: "participants:mine:#{uid}"]}
  end
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.ParticipantDeleted do
  import Rtc.Channels.NegotiatorHelper

  def negotiate(%{item: %{conversation_id: id, user_id: uid} = participant}) do
    {delta(participant, :delete),
     [participant_delta: "participants:#{id}", participant_delta: "participants:mine:#{uid}"]}
  end
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.ParticipantUpdated do
  import Rtc.Channels.NegotiatorHelper

  def negotiate(%{item: %{conversation_id: id, user_id: uid} = participant}) do
    {delta(participant, :update),
     [participant_delta: "participants:#{id}", participant_delta: "participants:mine:#{uid}"]}
  end
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.NotificationCreated do
  def negotiate(%{item: %{user_id: id} = notification}),
    do: {notification, [new_notifications: "notifications:#{id}"]}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.CommmandCreated do
  import Rtc.Channels.NegotiatorHelper

  def negotiate(%{item: command}),
    do: {delta(command, :create), [command_delta: "commands"]}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.CommmandUpdated do
  import Rtc.Channels.NegotiatorHelper

  def negotiate(%{item: command}),
    do: {delta(command, :updated), [command_delta: "commands"]}
end

defimpl Rtc.Channels.Negotiator, for: Core.PubSub.EmojiCreated do
  import Rtc.Channels.NegotiatorHelper

  def negotiate(%{item: emoji}),
    do: {delta(emoji, :create), [emoji_delta: "emoji"]}
end