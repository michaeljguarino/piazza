defmodule Core.EchoConsumer do
  use Core.PubSub.Consumers.Base, max_demand: 50

  def handle_event(%{source_pid: pid} = event) do
    send(pid, {:event, event})
    Core.Mailbox.broadcast(event)
  end
end