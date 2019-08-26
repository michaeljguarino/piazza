defmodule Gql.Clients.IncomingWebhook do
  def post(path, msg) do
    Mojito.post(path, [{"content-type", "application/json"}], Jason.encode!(msg))
  end
end