defmodule Core.Services.Platform.Webhooks do
  alias Core.Models.Command
  alias Core.Services.{Conversations, Platform}
  require Logger

  def send_hook(
    %Command{webhook: %{url: url, secret: secret}} = command,
    %{conversation_id: conv_id} = message
  ) do
    with {:ok, payload} <- Jason.encode(message),
         {:ok, %Mojito.Response{
                body: response,
                status_code: 200
            }
          } <- Mojito.post(url, webhook_headers(payload, secret), payload),
         {:ok, msg} <- handle_response(response) do
      webhook_interaction(msg, conv_id, command)
    else
      {:ok, %Mojito.Response{body: body}} -> {:error, :request_failed, body}
      error -> error
    end
  end

  defp webhook_interaction(%{"subscribe" => route_key}, conv_id, %Command{bot: bot} = command) do
    case Platform.upsert_webhook_route(route_key, conv_id, command) do
      {:ok, _} ->
        Conversations.create_message(conv_id, %{text: "Subscribed this conversation to #{route_key}"}, bot)
      _ -> Conversations.create_message(conv_id, %{text: "Could not subscribe to #{route_key} for reasons"}, bot)
    end
  end
  defp webhook_interaction(msg, conv_id, %Command{bot: bot}),
    do: Conversations.create_message(conv_id, msg, bot)

  defp webhook_headers(payload, secret) do
    epoch = :os.system_time(:millisecond)
    signature = :crypto.hash(:sha, "#{payload}:#{epoch}:#{secret}") |> Base.encode64()
    [
      {"content-type", "application/json"},
      {"accept", "application/json"},
      {"x-piazza-signature", signature},
      {"x-piazza-timestamp", "#{epoch}"}
    ]
  end

  defp handle_response("OK"), do: :ok
  defp handle_response(response), do: Jason.decode(response)
end