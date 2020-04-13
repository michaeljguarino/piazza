defprotocol Core.PubSub.Email do
  @fallback_to_any true

  @spec construct(struct) :: Bamboo.Email.t | :ok
  def construct(event)
end

defimpl Core.PubSub.Email, for: Any do
  def construct(_), do: :ok
end

defimpl Core.PubSub.Email, for: Core.PubSub.PasswordReset do
  def construct(%{item: token}),
    do: Email.Builder.reset_password(token)
end