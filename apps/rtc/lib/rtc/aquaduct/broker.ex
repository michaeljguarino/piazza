defmodule Rtc.Aquaduct.Broker do
  use Aquaduct.Topology, otp_app: :rtc

  incoming Rtc.Aquaduct do
    pipe_through [:in_tracking, :error_handling, :deserialize]
    subscribe :message, Subscriber, from: "piazza.rtc"
  end
end