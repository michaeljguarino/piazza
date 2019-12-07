defprotocol GraphQl.Errors do
  @fallback_to_any true
  def message(_)
end

defimpl GraphQl.Errors, for: Any do
  def message(except), do: Exception.message(except)
end

defimpl GraphQl.Errors, for: Ecto.NoResultsError do
  def message(_), do: "That record does not exist"
end