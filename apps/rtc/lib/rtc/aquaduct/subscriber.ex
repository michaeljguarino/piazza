defmodule Rtc.Aquaduct.Subscriber do
  use Conduit.Subscriber
  import Conduit.Message

  def process(message, _opts), do: ack(message)
end