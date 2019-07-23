defprotocol Core.Notifications.Notifiable do
  @fallback_to_any true

  def preload(event)

  def message(event)

  def user_ids(event)

  def actor(event)
end

defimpl Core.Notifications.Notifiable, for: Any do
  def preload(_), do: :ok

  def message(_), do: :ok

  def user_ids(_), do: :ok

  def actor(_), do: :ok
end