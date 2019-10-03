defprotocol Core.PubSub.Cache do
  @fallback_to_any true
  def prime(event)
end

defimpl Core.PubSub.Cache, for: Any do
  def prime(_), do: :ok
end