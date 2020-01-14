defprotocol Core.PubSub.Fanout do
  @fallback_to_any true

  def fanout(event)
end

defimpl Core.PubSub.Fanout, for: Any do
  def fanout(_), do: :ok
end

defimpl Core.PubSub.Fanout, for: [Core.PubSub.MessageCreated, Core.PubSub.MessageDeleted, Core.PubSub.MessageUpdated] do
  alias Core.Services.Conversations

  def fanout(%{item: %{conversation_id: cid} = message, actor: actor}) do
    [%Core.PubSub.MessageFanout{
      item: message,
      actor: actor,
      user: actor,
      delta: @for} | to_participants(cid, message, actor)
    ]
    |> Enum.uniq_by(& &1.user.id)
  end

  defp to_participants(cid, message, actor) do
    Conversations.get_participants(cid)
    |> Enum.map(& %Core.PubSub.MessageFanout{
      item: message,
      actor: actor,
      user: &1.user,
      delta: @for
    })
  end
end