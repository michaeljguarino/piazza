defmodule Core.PubSub.Consumers.Fanout do
  @moduledoc """
  Splits and resends given event into a list of
  duplicate events, for instance for each participant
  in a conversation.
  """
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 10

  def handle_event(event) do
    with [_ | _] = events <- Core.PubSub.Fanout.fanout(event) do
      Enum.each(events, &Core.PubSub.Broadcaster.notify/1)
    end
  end
end