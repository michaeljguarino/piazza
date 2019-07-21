defprotocol Core.Recurse.Traversable do
  @fallback_to_any true

  def traverse(event)
end

defimpl Core.Recurse.Traversable, for: Any do
  def traverse(_), do: :ok
end