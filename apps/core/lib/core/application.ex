defmodule Core.Application do
  @moduledoc false
  use Application
  alias Thrift.Generated.RtcService.Binary.Framed.Client
  alias Core.Services.License
  import Cachex.Spec
  import Supervisor.Spec

  def start(_type, _args) do
    children = [
      Core.Repo,
      Core.PubSub.Broadcaster,
      worker(Piazza.Crypto.License, [conf(:license), conf(:public_key), &License.invalid/1, &License.validate/2]),
      worker(Cachex, [:participants, [expiration: expiration(default: :timer.minutes(20))]])
    ] ++ conf(:consumers, [])
      ++ broker()
      ++ rtc_client()

    Supervisor.start_link(children, strategy: :one_for_one, name: Core.Supervisor)
  end

  defp conf(key, default \\ nil), do: Application.get_env(:core, key, default)

  def rtc_client() do
    if conf(:start_rtc_client) do
      [%{
        id: Client,
        start: {Client, :start_link, [conf(:rtc_host), 9090, [name: Core.RtcClient]]},
        type: :supervisor
      }]
    else
      []
    end
  end

  def broker() do
    case conf(:start_broker) do
      true -> [{Core.Aquaduct.Broker, []}]
      _ -> []
    end
  end
end
