defmodule Core.Aquaduct.UnfurlSubscriber do
  use Conduit.Subscriber
  import Conduit.Message
  require Logger

  def process(%{body: {msg, matches, command, actor}} = message, _opts) do
    payload = Jason.encode!(%{"matches" => matches})
    case Core.Services.Platform.Webhooks.send_unfurl(command, payload, msg, actor) |> IO.inspect() do
      {:ok, _} ->
        ack(message)
      error ->
        Logger.info "Webhook failed: #{inspect(error)}"
        ack(message)
    end
  end
end