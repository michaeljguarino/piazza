defmodule Core.Aquaduct.WebhookSubscriber do
  use Conduit.Subscriber
  import Conduit.Message
  require Logger

  def process(%{body: {webhook, actor, msg}} = message, _opts) do
    Logger.info "Processing webhook for #{msg.text}"
    case Core.Services.Platform.Webhooks.send_hook(webhook, msg, actor) do
      {:ok, _} ->
        ack(message)
      error ->
        Logger.info "Webhook failed: #{inspect(error)}"
        ack(message)
    end
  end
end