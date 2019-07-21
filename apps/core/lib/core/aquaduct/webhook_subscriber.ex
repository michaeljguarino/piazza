defmodule Core.Aquaduct.WebhookSubscriber do
  use Conduit.Subscriber
  import Conduit.Message

  def process(%{body: {webhook, actor, msg}} = message, _opts) do
    case Core.Services.Platform.Webhooks.send_hook(webhook, msg, actor) do
      {:ok, _} -> ack(message)
      _ -> nack(message)
    end
  end
end