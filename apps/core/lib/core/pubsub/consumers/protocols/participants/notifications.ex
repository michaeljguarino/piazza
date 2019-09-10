defimpl Core.PubSub.Invitable, for: Core.PubSub.NotificationCreated do
  def invite(%{item: %{user_id: user_id, actor_id: actor_id, message: %{conversation_id: conv_id}}}), 
    do: {conv_id, user_id, actor_id}
  def invite(_), do: :ok
end