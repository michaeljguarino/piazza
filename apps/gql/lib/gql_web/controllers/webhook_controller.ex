defmodule GqlWeb.WebhookController do
  use GqlWeb, :controller

  def giphy(conn, %{"text" => "/giphy " <> search}) do
    with {:ok, uri} <- Gql.Clients.Giphy.random(search) do
      json(conn, %{"message" => "Here's a [#{search}](#{uri})"})
    end
  end
  def giphy(_, _), do: {:error, :not_found}
end