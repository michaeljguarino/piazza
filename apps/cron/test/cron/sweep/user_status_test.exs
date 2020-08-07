defmodule Cron.Sweep.UserStatusTest do
  use Core.DataCase
  alias Cron.Sweep.UserStatus
  alias Core.PubSub

  describe "#run/1" do
    test "it will nullify all expired statuses and send pubsub events" do
      expired = insert_list(2, :user, status: %{text: "status"}, status_expires_at: Timex.now() |> Timex.shift(days: -1))
      ignore = insert(:user, status: %{text: "status"})

      with_mailbox fn ->
        2 = UserStatus.run()

        assert refetch(ignore).status.text == "status"

        for %{id: id} = user <- expired do
          refute refetch(user).status
          assert_receive {:event, %PubSub.UserUpdated{item: %{id: ^id, status: nil, status_expires_at: nil}}}
        end
      end
    end
  end
end