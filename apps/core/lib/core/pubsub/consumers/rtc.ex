defmodule Core.PubSub.Consumers.Rtc do
  use Core.PubSub.Consumers.Base, max_demand: 20

  def handle_event(event) do
    if Core.PubSub.Realtime.publish?(event) do
      Core.Aquaduct.Broker.publish(%Conduit.Message{body: event}, :rtc)
    end
  end
end