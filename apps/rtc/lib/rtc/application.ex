defmodule Rtc.Application do
  @moduledoc false
  use Application
  import Supervisor.Spec

  def start(_type, _args) do
    topologies = Application.get_env(:libcluster, :topologies)
    Rtc.Plug.MetricsExporter.setup()
    GraphQl.Instrumenter.install(GraphQl)

    children = [
      RtcWeb.Endpoint,
      Rtc.Presence,
      {Absinthe.Subscription, [RtcWeb.Endpoint]},
      {Cluster.Supervisor, [topologies, [name: Rtc.ClusterSupervisor]]},
      supervisor(GRPC.Server.Supervisor, [{Rtc.Piazza.Endpoint, 9090}]),
      worker(Rtc.GqlClient, []),
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
end
