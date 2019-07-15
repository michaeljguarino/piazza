defmodule Rtc.Application do
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = [
      RtcWeb.Endpoint,
      {Absinthe.Subscription, [RtcWeb.Endpoint]}
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
