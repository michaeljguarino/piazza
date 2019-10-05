defmodule GqlWeb.WebhookController do
  use GqlWeb, :controller
  alias Core.Commands.{Piazza, Github}
  alias Gql.Clients.Giphy

  def giphy(conn, %{"text" => "/giphy " <> search}) do
    interaction = get_interaction(conn)
    with {:ok, message} <- Giphy.random(search, interaction) do
      json(conn, message)
    end
  end
  def giphy(conn, params), do: giphy(conn, Map.put(params, "text", "/giphy random"))

  def giphy_interaction(conn, %{"shuffle" => shuffle}) do
    interaction = get_interaction(conn)
    with {:ok, message} <- Giphy.random(shuffle, interaction) do
      json(conn, message)
    end
  end
  def giphy_interaction(conn, %{"select" => url, "search" => search}) do
    text = "Here's what I found for #{search}"
    json(conn, %{text: text, structured_message: Giphy.build_message(url)})
  end

  def piazza(conn, %{"text" => "/piazza" <> args} = msg) do
    args = String.trim(args)

    with [command | args] <- String.split(args),
         {:ok, message} <- Piazza.dispatch(msg, command, args) do
      json(conn, %{text: message})
    else
      _ -> json(conn, %{text: "I don't understand what #{args} means, perhaps look at the help doc"})
    end
  end

  def github(conn, %{"text" => "/github " <> args} = msg) do
    args = String.trim(args)

    with [command | args] <- String.split(args),
         {:ok, message} <- Github.dispatch(msg, command, args) do
      json(conn, message)
    end
  end

  defp get_interaction(conn) do
    case get_req_header(conn, "x-piazza-interaction-id") do
      [interaction] -> interaction
      _ -> nil
    end
  end
end