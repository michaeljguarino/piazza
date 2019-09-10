defprotocol Core.PubSub.Invitable do
  @fallback_to_any true

  def invite(event)
end

defimpl Core.PubSub.Invitable, for: Any do
  def invite(_), do: :ok
end