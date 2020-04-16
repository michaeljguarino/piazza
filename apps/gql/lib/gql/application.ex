defmodule Gql.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false
  use Application
  import Supervisor.Spec

  def start(_type, _args) do
    topologies = Application.get_env(:libcluster, :topologies)
    Gql.Plug.MetricsExporter.setup()
    GraphQl.Instrumenter.install(GraphQl)

    children = [
      GqlWeb.Endpoint,
      {Cluster.Supervisor, [topologies, [name: Gql.ClusterSupervisor]]},
      supervisor(GRPC.Server.Supervisor, [{Core.Piazza.Endpoint, 9090}])
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Gql.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    GqlWeb.Endpoint.config_change(changed, removed)
    :ok
  end

  # defp server_child_spec(port) do
  #   supervisor(GRPC.Server.Supervisor, [{Core.Piazza.Endpoint, port}])
  # end
end
