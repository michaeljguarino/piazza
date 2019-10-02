defmodule Gql.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false
  alias Thrift.Generated.GqlService.Binary.Framed.Server
  use Application

  def start(_type, _args) do
    topologies = Application.get_env(:libcluster, :topologies)
    children = [
      GqlWeb.Endpoint,
      {Cluster.Supervisor, [topologies, [name: Gql.ClusterSupervisor]]}
    ] ++ start_server()

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Gql.Supervisor]
    Supervisor.start_link(children, opts)
  end

  def start_server() do
    case Application.get_env(:gql, :start_thrift_server) do
      true -> [server_child_spec(9090)]
      _ -> []
    end
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    GqlWeb.Endpoint.config_change(changed, removed)
    :ok
  end

  defp server_child_spec(port) do
    %{
      id: Server,
      start: {Server, :start_link, [Core.ServiceHandler, port]},
      type: :supervisor
    }
  end
end
