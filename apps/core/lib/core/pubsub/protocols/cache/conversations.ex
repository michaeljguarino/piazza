defimpl Core.PubSub.Cache, for: Core.PubSub.ParticipantCreated do
  def prime(%{item: %{conversation_id: id} = participant}) do
    participant = Core.Repo.preload(participant, [:user])
    Core.Cache.transaction(fn ->
      Core.Cache.refresh({:participants, id}, fn val ->
        [participant | val]
        |> Enum.uniq_by(fn %{id: id} -> id end)
      end)
    end)
  end
end

defimpl Core.PubSub.Cache, for: Core.PubSub.ParticipantUpdated do
  def prime(%{item: %{id: id, conversation_id: conv_id} = participant}) do
    participant = Core.Repo.preload(participant, [:user])
    Core.Cache.transaction(fn ->
      Core.Cache.refresh({:participants, conv_id}, fn val ->
        Enum.map(val, fn
          %{id: ^id} -> participant
          ignore -> ignore
        end)
      end)
    end)
  end
end

defimpl Core.PubSub.Cache, for: Core.PubSub.ParticipantDeleted do
  def prime(%{item: %{conversation: %{chat: true}}}), do: :ok
  def prime(%{item: %{id: id, conversation_id: conv_id}}) do
    Core.Cache.transaction(fn ->
      Core.Cache.refresh({:participants, conv_id}, fn val ->
        Enum.filter(val, fn
          %{id: ^id} -> false
          _ -> true
        end)
      end)
    end)
  end
end