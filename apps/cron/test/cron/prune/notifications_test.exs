defmodule Cron.Prune.NotificationsTest do
  use Core.DataCase, async: true

  describe "#run/1" do
    test "It will prune all notifications older than the supplied retention policy" do
      retention_policy = 3
      expired = DateTime.utc_now() |> Timex.shift(days: -4)
      ignored = insert_list(2, :notification)
      purged  = insert_list(4, :notification, inserted_at: expired)
      {:ok, 4} = Cron.Prune.Notifications.run("#{retention_policy}")

      for notif <- ignored, do: assert refetch(notif)
      for notif <- purged, do: refute refetch(notif)
    end
  end
end