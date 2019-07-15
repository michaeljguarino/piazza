defmodule Core.PubSub.Consumers.Integrity do
  use Core.PubSub.Consumers.Base, max_demand: 20

  def handle_event(event), do: Core.Integrity.Preservable.preserve(event)
end