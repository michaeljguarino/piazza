defmodule(Thrift.Generated.RtcService.Handler) do
  @moduledoc(false)
  (
    @callback(list_active(req :: %Thrift.Generated.ActiveUserRequest{}) :: %Thrift.Generated.ActiveUsers{})
    @callback(publish_event(event :: %Thrift.Generated.PubSubEvent{}) :: boolean())
  )
end