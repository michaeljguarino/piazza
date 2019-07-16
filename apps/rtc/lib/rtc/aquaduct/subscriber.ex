defmodule Rtc.Aquaduct.Subscriber do
  use Conduit.Subscriber
  import Conduit.Message

  def process(message, _opts) do
    case Rtc.Channels.Negotiator.negotiate(message.body) do
      {subscription, object, topic} ->
        :ok = Absinthe.Subscription.publish(RtcWeb.Endpoint, object, [{subscription, topic}])
        ack(message)
      _ -> ack(message)
    end
  end
end