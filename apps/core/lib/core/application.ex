defmodule Core.Application do
  @moduledoc false
  use Application
  alias Core.Services.License
  import Supervisor.Spec

  def start(_type, _args) do
    children = [
      Core.Repo,
      Core.PubSub.Broadcaster,
      Core.Cache.Local,
      Core.Cache.Replicated,
      Core.Cache,
      worker(Piazza.Crypto.License, [conf(:license), conf(:public_key), &License.invalid/1, &License.validate/1]),
      worker(Core.RtcClient, [])
    ] ++ conf(:consumers, [])
      ++ broker()

    Supervisor.start_link(children, strategy: :one_for_one, name: Core.Supervisor)
  end

  defp conf(key, default \\ nil), do: Application.get_env(:core, key, default)

  def broker() do
    case conf(:start_broker) do
      true -> [{Core.Aquaduct.Broker, []}]
      _ -> []
    end
  end
end
