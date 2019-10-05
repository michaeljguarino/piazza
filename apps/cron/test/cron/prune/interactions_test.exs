defmodule Cron.Prune.InteractionsTest do
  use Core.DataCase, async: true

  describe "#run/1" do
    test "It will prune all interactions older than the supplied retention policy" do
      retention_policy = 3
      expired = DateTime.utc_now() |> Timex.shift(days: -4)
      ignored = insert_list(2, :interaction)
      purged  = insert_list(4, :interaction, inserted_at: expired)
      {:ok, 4} = Cron.Prune.Interactions.run("#{retention_policy}")

      for interaction <- ignored, do: assert refetch(interaction)
      for interaction <- purged, do: refute refetch(interaction)
    end
  end
end