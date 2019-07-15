defprotocol Core.Integrity.Preservable do
  @fallback_to_any true

  def preserve(event)
end

defimpl Core.Integrity.Preservable, for: Any do
  def preserve(_), do: :ok
end