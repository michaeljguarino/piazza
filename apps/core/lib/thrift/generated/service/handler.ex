defmodule(Thrift.Generated.Service.Handler) do
  @moduledoc(false)
  @callback(ping_participant(request :: %Thrift.Generated.PingParticipant{}) :: boolean())
end