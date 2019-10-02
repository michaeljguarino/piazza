defimpl Core.PubSub.Cache, for: Core.PubSub.ParticipantCreated do
  def query(%{item: %{conversation_id: conv_id}}), do: {:participants, conv_id}

  def prime(%{item: %{conversation_id: id}}, _val) do
    Core.Cache.del(:participants, id)
  end
end

defimpl Core.PubSub.Cache, for: Core.PubSub.ParticipantUpdated do
  def query(%{item: %{conversation_id: conv_id}}), do: {:participants, conv_id}

  def prime(%{item: %{conversation_id: id} }, _val) do
    Core.Cache.del(:participants, id)
  end
end

defimpl Core.PubSub.Cache, for: Core.PubSub.ParticipantDeleted do
  def query(%{item: %{conversation_id: conv_id}}), do: {:participants, conv_id}

  def prime(%{item: %{conversation_id: id}}, _val) do
    Core.Cache.del(:participants, id)
  end
end