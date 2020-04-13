defprotocol Core.Notifications.Notifiable do
  @fallback_to_any true

  def preload(event)

  def message(event)

  def notifs(event)

  def actor(event)
end

defimpl Core.Notifications.Notifiable, for: Any do
  def preload(_), do: :ok

  def message(_), do: :ok

  def notifs(_), do: :ok

  def actor(_), do: :ok
end