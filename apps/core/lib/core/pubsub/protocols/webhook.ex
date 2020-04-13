defprotocol Core.PubSub.Webhook do
  @fallback_to_any true

  @doc """
  Finds a webhook to send to
  """
  @spec command(struct) :: {:ok, Core.Models.Command.t} | :ok
  def command(event)

  @doc """
  The payload for the webhook
  """
  @spec payload(struct) :: term
  def payload(event)

  @doc """
  The queue to publish to
  """
  @spec queue(struct) :: :webhook | :interaction
  def queue(event)

  @doc """
  The message which spawned the event
  """
  @spec message(struct) :: Core.Models.Message.t
  def message(event)
end

defimpl Core.PubSub.Webhook, for: Any do
  def command(_), do: :ok

  def payload(_), do: nil

  def queue(_), do: nil

  def message(_), do: nil
end