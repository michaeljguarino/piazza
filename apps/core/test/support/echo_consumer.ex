defmodule Core.EchoConsumer do
  use Piazza.PubSub.Consumer, 
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 20

  def handle_event(%{source_pid: pid} = event) do
    send(pid, {:event, event})
    Core.Mailbox.broadcast(event)
  end
end