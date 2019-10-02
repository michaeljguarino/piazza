defprotocol Core.PubSub.Cache do
  @fallback_to_any true
  def query(event)

  def prime(event, val)
end

defimpl Core.PubSub.Cache, for: Any do
  def query(_), do: :ok

  def prime(_, _), do: :ok
end