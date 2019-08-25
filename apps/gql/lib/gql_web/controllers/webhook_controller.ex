defmodule GqlWeb.WebhookController do
  use GqlWeb, :controller
  import Gql.Plug.WebhookValidators
  alias Core.Commands.Piazza

  plug :validate_github when action == :github

  def giphy(conn, %{"text" => "/giphy " <> search}) do
    with {:ok, message} <- Gql.Clients.Giphy.random(search) do
      json(conn, message)
    end
  end
  def giphy(conn, params), do: giphy(conn, Map.put(params, "text", "/giphy random gif"))

  def piazza(conn, %{"text" => "/piazza" <> args} = msg) do
    args = String.trim(args)

    with [command | args] <- String.split(args),
         {:ok, message} <- Piazza.dispatch(msg, command, args) do
      json(conn, %{message: message})
    else
      _ ->
        json(conn, %{message: "I don't understand what #{args} means, perhaps look at the help doc"})
    end
  end

  def github(conn, _params), do: json(conn, %{ok: true})
end