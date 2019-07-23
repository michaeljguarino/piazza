defmodule Core.Services.Notifications do
  use Core.Services.Base
  alias Core.Models.Notification

  def view_notifications(user) do
    Notification.for_user(user.id)
    |> Notification.unseen()
    |> Notification.selected()
    |> Core.Repo.update_all([set: [seen_at: DateTime.utc_now()]])
    |> elem(1)
    |> ok()
  end
end