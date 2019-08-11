defmodule(Thrift.Generated.RtcService.Handler) do
  @moduledoc(false)
  @callback(publish_event(event :: %Thrift.Generated.PubSubEvent{}) :: boolean())
end