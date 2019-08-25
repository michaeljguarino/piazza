defmodule GqlWeb.IncomingWebhookController do
  use GqlWeb, :controller
  alias Core.Services.Platform

  def dispatch(conn, %{"secure_id" => id} = params) do
    with {:ok, %{id: id}} <- Platform.dispatch_incoming_webhook(params, id),
      do: json(conn, %{id: id})
  end
end