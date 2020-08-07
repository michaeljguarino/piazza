defmodule Cron.Sweep.UserStatus do
  use Cron
  alias Core.{Models.User, Repo}
  alias Core.Services.Users

  def run() do
    User.with_expired_status()
    |> User.ordered(asc: :id)
    |> Repo.stream(method: :keyset)
    |> Stream.chunk_every(1000)
    |> Flow.from_enumerable(stages: 5, max_demand: 5)
    |> Flow.map(&process_chunk/1)
    |> log()
  end

  defp process_chunk(users) do
    {count, _} =
      users
      |> Enum.map(& &1.id)
      |> User.for_ids()
      |> Repo.update_all(set: [status_expires_at: nil, status: nil])

    Enum.each(users, &Users.notify({:ok, %{&1 | status_expires_at: nil, status: nil}}, :update))

    count
  end
end