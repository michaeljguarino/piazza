defmodule Core.Services.Platform.Webhooks do
  def send_hook(%{url: url, secret: secret}, %{conversation_id: conv_id} = message, bot) do
    with {:ok, payload} <- Jason.encode(message),
         {:ok, %Mojito.Response{
                body: response,
                status_code: 200
            }
          } <- Mojito.post(url, webhook_headers(payload, secret), payload),
         {:ok, msg} <- handle_response(response) do
      Core.Services.Conversations.create_message(conv_id, %{text: msg}, bot)
    else
      {:ok, %Mojito.Response{body: body}} -> {:error, :request_failed, body}
      error -> error
    end
  end

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
  defp handle_response(response) do
    with {:ok, %{"message" => message}} <- Jason.decode(response) do
      {:ok, message}
    end
  end
end