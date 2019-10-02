defmodule Core.PubSub.Consumers.Cache do
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 20

  def handle_event(event) do
    with {table, key} <- Core.PubSub.Cache.query(event),
         {:ok, val} <- Core.Cache.get(table, key),
      do: Core.PubSub.Cache.prime(event, val)
  end
end