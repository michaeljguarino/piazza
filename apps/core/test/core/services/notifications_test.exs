defmodule Core.Services.NotificationsTest do
  use Core.DataCase, async: true
  alias Core.Services.Notifications

  describe "#view_notifications/1" do
    test "It can mark all unseen notifications for a user as viewed" do
      user   = insert(:user)
      unseen = insert_list(2, :notification, user: user)
      insert_list(3, :notification, seen_at: DateTime.utc_now(), user: user)

      {:ok, notifs} = Notifications.view_notifications(user)

      assert ids_equal(notifs, unseen)
      assert Enum.all?(notifs, & &1.seen_at)
    end
  end

  describe "#unseen_count/1" do
    test "It can tally unseen notifs for a user" do
      user = insert(:user)
      insert_list(2, :notification, user: user)
      insert_list(3, :notification, seen_at: DateTime.utc_now(), user: user)

      assert Notifications.unseen_count(user) == 2
    end
  end
end