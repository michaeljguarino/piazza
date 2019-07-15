defmodule Core.PubSub.Consumers.Rtc do
  use Core.PubSub.Consumers.Base, max_demand: 20

  def handle_event(event) do
    Aquaduct.Broker.publish(%Conduit.Message{body: event}, :rtc)
  end
end