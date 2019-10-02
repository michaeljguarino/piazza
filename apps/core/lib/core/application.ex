defmodule Core.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false
  use Application
  alias Thrift.Generated.RtcService.Binary.Framed.Client
  import Cachex.Spec
  import Supervisor.Spec

  def start(_type, _args) do
    children = [
      Core.Repo,
      Core.PubSub.Broadcaster,
      worker(Cachex, [:participants, [expiration: expiration(default: :timer.minutes(20))]])
    ] ++ consumers()
      ++ broker()
      ++ rtc_client()

    Supervisor.start_link(children, strategy: :one_for_one, name: Core.Supervisor)
  end

  defp consumers(), do: Application.get_env(:core, :consumers, [])

  def rtc_client() do
    if Application.get_env(:core, :start_rtc_client) do
      [%{
        id: Client,
        start: {Client, :start_link, [host(), 9090, [name: Core.RtcClient]]},
        type: :supervisor
      }]
    else
      []
    end
  end

  def broker() do
    case Application.get_env(:core, :start_broker) do
      true -> [{Core.Aquaduct.Broker, []}]
      _ -> []
    end
  end

  defp host(), do: Application.get_env(:core, :rtc_host)
end
