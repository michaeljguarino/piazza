defmodule GqlWeb.IncomingWebhookController do
  use GqlWeb, :controller
  alias Core.Services.Platform

  def dispatch(conn, %{"secure_id" => id} = params) do
    IO.inspect(params)
    with {:ok, %{id: id}} <- Platform.dispatch_incoming_webhook(params, id) |> IO.inspect(),
      do: json(conn, %{id: id})
  end

  def slack_dispatch(conn, %{"secure_id" => id} = params) do
    with {:ok, %{id: id}} <- translate_from_slack(params, id),
      do: json(conn, %{id: id})
  end

  def translate_from_slack(params, id) do
    case Platform.Slack.translate(params) do
      {:plain, text} -> Platform.dispatch_incoming_webhook(%{"text" => text}, id)
      {:structured, structured} ->
        Platform.dispatch_incoming_webhook(%{"structured_message" => structured, "text" => "__placeholder__"}, id)
      error -> error
    end
  end
end