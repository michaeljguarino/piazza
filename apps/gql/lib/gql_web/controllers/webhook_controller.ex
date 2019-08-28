defmodule GqlWeb.WebhookController do
  use GqlWeb, :controller
  alias Core.Commands.{Piazza, Github}

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
      json(conn, %{text: message})
    else
      _ ->
        json(conn, %{text: "I don't understand what #{args} means, perhaps look at the help doc"})
    end
  end

  def github(conn, %{"text" => "/github " <> args} = msg) do
    args = String.trim(args)

    with [command | args] <- String.split(args),
         {:ok, message} <- Github.dispatch(msg, command, args) do
      json(conn, message)
    end
  end
end