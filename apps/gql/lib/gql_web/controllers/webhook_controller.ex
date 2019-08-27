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

  def github(conn, %{
    "head_commit" => %{"message" => message, "author" => %{"name" => author}, "url" => url},
    "repository" => %{"full_name" => repo_name, "html_url" => repo_url},
    "sender" => %{"avatar_url" => avatar, "login" => login},
    "ref" => "refs/heads/" <> branch,
    "after" => sha
  }) do
    simple_msg = "#{author} pushed to #{repo_name} #{branch}"

    structured_message = %{
      text: simple_msg,
      structured_message: """
        <root>
          <box pad="xsmall">
            <link href="#{repo_url}" target="_blank">
              <text size="small" weight="bold">
                #{author} pushed to #{repo_name}:#{branch}
              </text>
            </link>
          </box>
          <attachment gap="small" pad="small" accent="black">
            <box align="center" direction="row" gap="xsmall">
              <image width="25px" height="25px" url="#{avatar}" />
              <text size="small" weight="bold">#{login}</text>
            </box>
            <markdown size="small">#{message}</markdown>
            <box gap="xxsmall">
              <text size="small" color="light-5">branch: #{branch}</text>
              <link href="#{url}" target="_blank">
                <text size="small" color="light-5">sha: #{sha}</text>
              </link>
            </box>
          </attachment>
        </root>
      """
    }

    path = incoming_webhook(:github)
    with {:ok, _} <- Gql.Clients.IncomingWebhook.post(path, structured_message),
      do: json(conn, structured_message)
  end
  def github(conn, _), do: json(conn, %{ok: true})

  defp incoming_webhook(:github),
    do: Application.get_env(:gql, :github_incoming_webhook)
end