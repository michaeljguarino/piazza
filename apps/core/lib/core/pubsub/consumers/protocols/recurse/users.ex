defimpl Core.Recurse.Traversable, for: Core.PubSub.UserCreated do
  import Core.Services.Base, only: [timestamped: 1]
  alias Core.Models.{Conversation, Participant}

  def traverse(%{item: %{id: user_id}}) do
    Conversation.global()
    |> Conversation.ordered(asc: :id)
    |> Core.Repo.stream(method: :keyset)
    |> Stream.chunk_every(10)
    |> Flow.from_enumerable(stages: 5, max_demand: 3)
    |> Flow.map(fn chunk ->
      records = Enum.map(chunk, &build_update(&1, user_id))

      Core.Repo.insert_all(Participant, records,
        on_conflict: :replace_all_except_primary_key,
        conflict_target: [:user_id, :conversation_id]
      )
      |> elem(0)
    end)
    |> Enum.sum()
  end

  defp build_update(%{id: conv_id}, user_id),
    do: timestamped(%{conversation_id: conv_id, user_id: user_id})
end