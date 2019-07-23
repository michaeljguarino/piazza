defmodule Core.Resolvers.Notification do
  use Core.Resolvers.Base, model: Core.Models.Notification

  def list_notifications(args, %{context: %{current_user: user}}) do
    Notification.for_user(user.id)
    |> Notification.unseen()
    |> Notification.ordered()
    |> paginate(args)
  end

  def view_notifications(_, %{context: %{current_user: user}}) do
    Core.Services.Notifications.view_notifications(user)
  end
end