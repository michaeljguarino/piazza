defmodule Aquaduct.Application do
  use Application

  def start(_type, _args) do
    children = [
      {Aquaduct.Broker, []},
    ]

    opts = [strategy: :one_for_one, name: ConduitAmqpExample.Supervisor]
    Supervisor.start_link(children, opts)
  end
end