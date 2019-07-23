defimpl Core.Notifications.Notifiable, for: Core.PubSub.MessageCreated do
  def preload(%{item: msg} = event), do: {:ok, %{event | item: Core.Repo.preload(msg, [:creator, :entities])}}

  def message(%{item: msg}), do: msg

  def user_ids(%{item: %{entities: entities}}), do: Enum.map(entities, & &1.user_id)

  def actor(%{item: %{creator: user}}), do: user
end