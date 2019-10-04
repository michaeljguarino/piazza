defmodule Core.PubSub.Consumers.Cache do
  @moduledoc """
  Refreshes cache in response to changes implied by the given event.

  Utilizes   Core.Cache.transaction` if atomicity is required.
  """
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 20

  def handle_event(event) do
    Core.PubSub.Cache.prime(event)
  end
end