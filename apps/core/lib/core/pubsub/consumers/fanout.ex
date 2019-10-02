defmodule Core.PubSub.Consumers.Fanout do
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 10

  def handle_event(event) do
    with [_ | _] = events <- Core.PubSub.Fanout.fanout(event) do
      Enum.each(events, &Core.PubSub.Broadcaster.notify/1)
    end
  end
end