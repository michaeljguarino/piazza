defmodule Core.PubSub.Consumers.Recurse do
  @moduledoc """
  Consumer for handling generic pubsub action on the current event
  stream.  Things like unfurling urls should go here
  """
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 10

  def handle_event(event), do: Core.Recurse.Traversable.traverse(event)
end