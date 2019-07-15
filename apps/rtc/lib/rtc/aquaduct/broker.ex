defmodule Rtc.Aquaduct.Broker do
  use Aquaduct.Sink, otp_app: :rtc

  incoming Rtc.Aquaduct do
    pipe_through [:deserialize]
    subscribe :message, Subscriber, from: "piazza.rtc"
  end
end