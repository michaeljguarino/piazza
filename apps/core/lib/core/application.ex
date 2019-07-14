defmodule Core.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = [
      Core.Repo,
      Core.PubSub.Broadcaster
    ] ++ consumers()

    Supervisor.start_link(children, strategy: :one_for_one, name: Core.Supervisor)
  end

  defp consumers(), do: Application.get_env(:core, :consumers, [])
end
