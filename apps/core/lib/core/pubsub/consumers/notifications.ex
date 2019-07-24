defmodule Core.PubSub.Consumers.Notifications do
  use Core.PubSub.Consumers.Base, max_demand: 10
  import Core.Services.Base
  alias Core.Notifications.Notifiable
  alias Core.Models.Notification

  def handle_event(event) do
    with {:ok, event} <- Notifiable.preload(event),
         [_ | _] = notifs <- Notifiable.notifs(event) do
      msg    = Notifiable.message(event)
      actor  = Notifiable.actor(event)
      data = Enum.map(notifs, fn {type, user_id} ->
        timestamped(%{
          user_id: user_id,
          type: type,
          actor_id: actor.id,
          message_id: msg.id
        })
      end)

      {_, notifications} = Core.Repo.insert_all(Notification, data, returning: true)
      Enum.each(notifications, &handle_notify(Core.PubSub.NotificationCreated, &1))
      {:ok, notifications}
    else
      _ -> :ok
    end
  end
end