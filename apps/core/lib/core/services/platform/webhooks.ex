defmodule Core.Services.Platform.Webhooks do
  alias Core.Models.Command
  alias Core.Services.{Conversations, Platform}
  require Logger

  def send_hook(%Command{webhook: %{url: url}} = command, payload, %{conversation_id: conv_id} = message) do
    with {:ok, msg} <- do_send_hook(url, command, payload, message),
      do: webhook_interaction(msg, conv_id, command, message)
  end

  def send_interaction(%Command{webhook: %{url: url}} = command, payload, %{conversation_id: conv_id} = message) do
    Path.join(url, "interaction")
    |> do_send_hook(command, payload, message)
    |> case do
      {:ok, msg} -> webhook_interaction(msg, conv_id, command, message)
      error -> error
    end
  end

  def send_unfurl(
    %Command{webhook: %{url: url}} = command,
    payload,
    %{conversation_id: conv_id} = message,
    user
  ) do
    Path.join(url, "unfurl")
    |> do_send_hook(command, payload, message)
    |> case do
      {:ok, msg} -> Conversations.create_message(conv_id, msg, user)
      error -> error
    end
  end

  defp do_send_hook(
    url,
    %Command{webhook: %{secret: secret}} = command,
    payload,
    message
  ) do
    with {:ok, %{id: id}} <- Platform.create_interaction(command, message),
         {:ok, %Mojito.Response{
                body: response,
                status_code: 200
            }
          } <- Mojito.post(url, webhook_headers(id, payload, secret), payload) do
      handle_response(response)
    else
      {:ok, %Mojito.Response{body: body}} -> {:error, :request_failed, body}
      error -> error
    end
  end

  defp webhook_interaction(resp, conv_id, command, message)
  defp webhook_interaction(%{"subscribe" => route_key}, conv_id, %Command{bot: bot} = command, _) do
    case Platform.upsert_webhook_route(route_key, conv_id, command) do
      {:ok, _} ->
        Conversations.create_message(conv_id, %{text: "Subscribed this conversation to #{route_key}"}, bot)
      _ ->
        Conversations.create_message(conv_id, %{text: "Could not subscribe to #{route_key} for reasons"}, bot)
    end
  end
  defp webhook_interaction(%{"dialog" => msg}, _, %Command{bot: bot}, message),
    do: Conversations.create_dialog(msg, message, bot)
  defp webhook_interaction(msg, conv_id, %Command{bot: bot}, _),
    do: Conversations.create_message(conv_id, msg, bot)

  defp webhook_headers(id, payload, secret) do
    epoch = :os.system_time(:millisecond)
    signature = :crypto.hash(:sha, "#{payload}:#{epoch}:#{secret}") |> Base.url_encode64()
    [
      {"content-type", "application/json"},
      {"accept", "application/json"},
      {"x-piazza-signature", signature},
      {"x-piazza-timestamp", "#{epoch}"},
      {"x-piazza-interaction-id", id}
    ]
  end

  defp handle_response("OK"), do: :ok
  defp handle_response(response), do: Jason.decode(response)
end