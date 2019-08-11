defmodule Rtc.ServiceHandler do
  @behaviour Thrift.Generated.RtcService.Handler
  alias Thrift.Generated.PubSubEvent

  def publish_event(%PubSubEvent{event: event}) do
    event = :erlang.binary_to_term(event)
    with {object, topics} <- Rtc.Channels.Negotiator.negotiate(event),
      do: Absinthe.Subscription.publish(RtcWeb.Endpoint, object, topics)
    true
  end
end