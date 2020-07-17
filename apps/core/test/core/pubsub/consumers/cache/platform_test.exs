defmodule Core.PubSub.Consumers.Cache.PlatformTest do
  use Core.DataCase, async: false
  alias Core.PubSub
  alias PubSub.Consumers.Cache
  alias Core.Cache.Replicated

  describe "CommandCreated" do
    test "It will wipe the unfurlers key" do
      Replicated.set(:unfurlers, :dummy)

      event = %PubSub.CommandCreated{item: insert(:command)}
      Cache.handle_event(event)

      refute Replicated.get(:unfurlers)
    end
  end

  describe "CommandUpdated" do
    test "It will wipe the unfurlers key" do
      Replicated.set(:unfurlers, :dummy)

      event = %PubSub.CommandUpdated{item: insert(:command)}
      Cache.handle_event(event)

      refute Replicated.get(:unfurlers)
    end
  end
end