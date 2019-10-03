defmodule Core.PubSub.Consumers.Cache do
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 20

  def handle_event(event) do
    Core.PubSub.Cache.prime(event)
  end
end