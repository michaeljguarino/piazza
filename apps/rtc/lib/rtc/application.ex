defmodule Rtc.Application do
  @moduledoc false

  use Application
  alias Thrift.Generated.RtcService.Binary.Framed.Server

  def start(_type, _args) do
    topologies = Application.get_env(:libcluster, :topologies)
    children = [
      RtcWeb.Endpoint,
      Rtc.Presence,
      {Absinthe.Subscription, [RtcWeb.Endpoint]},
      {Cluster.Supervisor, [topologies, [name: Rtc.ClusterSupervisor]]}
    ] ++ broker()

    opts = [strategy: :one_for_one, name: Rtc.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    RtcWeb.Endpoint.config_change(changed, removed)
    :ok
  end

  def broker() do
    case Application.get_env(:rtc, :start_broker) do
      true -> [{Rtc.Aquaduct.Broker, []}]
      _ -> []
    end
  end

  def thrift_server() do
    if Application.get_env(:rtc, :start_thrift_server) do
      [server_child_spec(9090)]
    else
      []
    end
  end

  defp server_child_spec(port) do
    %{
      id: Server,
      start: {Server, :start_link, [Rtc.ServiceHandler, port]},
      type: :supervisor
    }
  end

  defp host(), do: Application.get_env(:rtc, :gql_host)
end
