defmodule Core.EchoConsumer do
  use Core.PubSub.Consumers.Base, handler: Core.EchoHandler, max_demand: 50
end

defmodule Core.EchoHandler do
  def handle_event(%{source_pid: pid} = event), do: send(pid, {:event, event})
end