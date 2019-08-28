defmodule Core.Commands.Github do
  use Core.Commands.Base

  command :github

  subcommand :subscribe do
    args ["repo"]
    doc "Configures the github-side webhook and allows github events to be routed to different channels"
    handler :subscribe
  end
  def subscribe(_, repo) do
    {:ok, %{"subscribe" => repo}} # not doing the github api crap yet
  end
end