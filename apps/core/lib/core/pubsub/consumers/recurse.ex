defmodule Core.PubSub.Consumers.Recurse do
  use Core.PubSub.Consumers.Base, max_demand: 20

  def handle_event(event), do: Core.Recurse.Traversable.traverse(event)
end