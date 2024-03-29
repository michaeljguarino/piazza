defmodule Core.Aquaduct.WebhookSubscriber do
  use Conduit.Subscriber
  import Conduit.Message
  require Logger

  def process(%{body: {command, payload, msg}} = message, _opts) do
    case Core.Services.Platform.Webhooks.send_hook(command, payload, msg) do
      {:ok, _} ->
        ack(message)
      error ->
        Logger.info "Webhook failed: #{inspect(error)}"
        ack(message)
    end
  end
end