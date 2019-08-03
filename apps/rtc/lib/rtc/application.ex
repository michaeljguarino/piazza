defmodule Rtc.Application do
  @moduledoc false

  use Application
  alias Thrift.Generated.Service.Binary.Framed.{Client, Server}

  def start(_type, _args) do
    topologies = Application.get_env(:libcluster, :topologies)
    children = [
      RtcWeb.Endpoint,
      Rtc.Presence,
      {Absinthe.Subscription, [RtcWeb.Endpoint]},
      {Cluster.Supervisor, [topologies, [name: MyApp.ClusterSupervisor]]}
    ] ++ broker() ++ gql_client() ++ gql_server()

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

  def gql_client() do
    if Application.get_env(:rtc, :start_client) do
      [%{
        id: Client,
        start: {Client, :start_link, [host(), 9090, [name: Rtc.GqlClient]]},
        type: :supervisor
      }]
    else
      []
    end
  end

  def gql_server() do
    if Application.get_env(:rtc, :start_server) do
      [server_child_spec(9090)]
    else
      []
    end
  end

  defp server_child_spec(port) do
    %{
      id: Server,
      start: {Server, :start_link, [Core.ServiceHandler, port]},
      type: :supervisor
    }
  end

  defp host(), do: Application.get_env(:rtc, :gql_host)
end
