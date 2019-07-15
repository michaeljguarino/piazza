defmodule Aquaduct.Broker do

  use Conduit.Broker, otp_app: :aquaduct

  configure do
    exchange "piazza.topic", type: :topic, durable: true
    queue "piazza.rtc", from: ["#.rtc"], exchange: "piazza.topic", durable: true
    queue "piazza.rtc.zzz", from: ["#.rtc.zzz"], exchange: "piazza.topic", durable: true
  end

  pipeline :out_tracking do
    plug Conduit.Plug.CorrelationId
    plug Conduit.Plug.CreatedBy, app: "aquaduct"
    plug Conduit.Plug.CreatedAt
    plug Conduit.Plug.LogOutgoing
  end

  pipeline :serialize do
    plug Conduit.Plug.Format, content_type: "application/x-erlang-binary"
  end

  pipeline :error_destination do
    plug :put_destination, &(&1.source <> ".zzz")
  end

  outgoing do
    pipe_through [:out_tracking, :serialize]

    publish :rtc, exchange: "piazza.topic", to: "piazza.rtc"
  end

  outgoing do
    pipe_through [:error_destination, :out_tracking, :serialize]

    publish :error, exchange: "piazza.topic", to: "piazza.error"
  end
end
