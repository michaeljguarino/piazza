defmodule Cron.Prune.MessagesTest do
  use Core.DataCase, async: true

  describe "#run/1" do
    test "It will prune all messages older than the supplied retention policy" do
      retention_policy = 3
      expired = DateTime.utc_now() |> DateTime.add(-retention_policy * 60 * 60 * 24 - 30, :second)
      ignored = insert_list(2, :message)
      purged  = insert_list(4, :message, inserted_at: expired)
      insert(:message,
        conversation: build(:conversation, archived_at: DateTime.utc_now()),
        inserted_at: expired
      )
      {:ok, 4} = Cron.Prune.Messages.run("#{retention_policy}")

      for msg <- ignored, do: assert refetch(msg)
      for msg <- purged, do: refute refetch(msg)
    end
  end
end