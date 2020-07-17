defimpl Core.PubSub.Cache, for: [Core.PubSub.CommandCreated, Core.PubSub.CommandUpdated] do
  def prime(_), do: Core.Cache.Replicated.delete(:unfurlers)
end