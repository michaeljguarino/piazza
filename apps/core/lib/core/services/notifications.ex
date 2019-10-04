defmodule Core.Services.Notifications do
  use Core.Services.Base
  alias Core.Models.Notification

  @type notif_resp :: {:ok, [Notification.t]} | error

  @doc """
  Marks all notifiations as viewed for `user`
  """
  @spec view_notifications(User.t) :: notif_resp
  def view_notifications(user) do
    update_for_user(user.id)
    |> elem(1)
    |> ok()
  end

  @doc """
  Views all notifications associated with `conversation_id`
  """
  @spec view_notifications(binary, User.t) :: notif_resp
  def view_notifications(conversation_id, user) do
    Notification.for_conversation(conversation_id)
    |> update_for_user(user.id)
    |> elem(1)
    |> ok()
  end

  defp update_for_user(query \\ Notification, user_id) do
    query
    |> Notification.for_user(user_id)
    |> Notification.unseen()
    |> Notification.selected()
    |> Core.Repo.update_all([set: [seen_at: DateTime.utc_now()]])
  end

  @doc """
  Number of unseen notifications for user
  """
  @spec unseen_count(User.t) :: integer
  def unseen_count(user) do
    Notification.for_user(user.id)
    |> Notification.unseen()
    |> Core.Repo.aggregate(:count, :id)
  end
end