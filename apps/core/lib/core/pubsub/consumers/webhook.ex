defmodule Core.PubSub.Consumers.Webhook do
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 10

  alias Core.PubSub.Webhook
  alias Core.Aquaduct.Broker

  def handle_event(event) do
    with {:ok, target} <- Webhook.command(event),
         queue <- Webhook.queue(event),
         payload <- Webhook.payload(event),
         message <- Webhook.message(event),
      do: Broker.publish(%Conduit.Message{body: {target, payload, message}}, queue)
  end
end