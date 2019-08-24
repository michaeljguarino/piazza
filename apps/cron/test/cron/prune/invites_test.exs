defmodule Cron.Prune.InvitesTest do
  use Core.DataCase, async: true

  describe "#run/1" do
    test "It will prune all invites older than the supplied retention policy" do
      retention_policy = 3
      expired = DateTime.utc_now() |> Timex.shift(days: -4)
      ignored = insert_list(2, :invite)
      purged  = insert_list(4, :invite, inserted_at: expired)
      {:ok, 4} = Cron.Prune.Invites.run("#{retention_policy}")

      for invite <- ignored, do: assert refetch(invite)
      for invite <- purged, do: refute refetch(invite)
    end
  end
end