defmodule Core.Services.Notifications do
  use Core.Services.Base
  alias Core.Models.Notification

  def view_notifications(user) do
    update_for_user(user.id)
    |> elem(1)
    |> ok()
  end

  def view_notifications(conversation_id, user) do
    Notification.for_conversation(conversation_id)
    |> update_for_user(user.id)
    |> elem(1)
    |> ok()
  end

  def update_for_user(query \\ Notification, user_id) do
    query
    |> Notification.for_user(user_id)
    |> Notification.unseen()
    |> Notification.selected()
    |> Core.Repo.update_all([set: [seen_at: DateTime.utc_now()]])
  end

  def unseen_count(user) do
    Notification.for_user(user.id)
    |> Notification.unseen()
    |> Core.Repo.aggregate(:count, :id)
  end
end