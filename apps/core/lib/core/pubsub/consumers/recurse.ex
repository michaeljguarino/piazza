defmodule Core.PubSub.Consumers.Recurse do
  use Piazza.PubSub.Consumer, 
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 10

  def handle_event(event), do: Core.Recurse.Traversable.traverse(event)
end