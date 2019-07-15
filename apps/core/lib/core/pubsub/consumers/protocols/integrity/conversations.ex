defimpl Core.Integrity.Preservable, for: Core.PubSub.ConversationCreated do
  import Core.Services.Base, only: [timestamped: 1]
  alias Core.Models.{User, Participant}

  def preserve(%{item: %{id: conv_id, global: true}}) do
    User
    |> User.ordered(asc: :id)
    |> Core.Repo.stream(method: :keyset)
    |> Stream.chunk_every(50)
    |> Flow.from_enumerable(stages: 5, max_demand: 5)
    |> Flow.map(fn chunk ->
      records = Enum.map(chunk, &build_update(&1, conv_id))

      Core.Repo.insert_all(Participant, records,
        conflict_target: [:user_id, :conversation_id],
        on_conflict: :replace_all_except_primary_key
      )
      |> elem(0)
    end)
    |> Enum.sum()
  end
  def preserve(_), do: :ok

  defp build_update(%{id: user_id}, conv_id),
    do: timestamped(%{conversation_id: conv_id, user_id: user_id})
end