defimpl Core.Notifications.Notifiable, for: Core.PubSub.MessageCreated do
  alias Core.Models.Participant

  def preload(%{item: msg} = event),
    do: {:ok, %{event | item: Core.Repo.preload(msg, [:creator, [entities: :user]])}}

  def message(%{item: msg}), do: msg

  def notifs(%{item: %{entities: entities} = msg}) do
    participants = get_participants(msg.conversation_id)
    by_user      = Enum.into(participants, %{}, & {&1.user_id, &1})
    mentions     = filter_mentions(entities, by_user)

    mentioned_users = Enum.map(entities, & &1.user_id) |> MapSet.new()

    participants
    |> Enum.filter(& &1.user_id not in mentioned_users)
    |> Enum.filter(& &1.user_id != msg.creator_id)
    |> Enum.filter(fn
      %{user: %{notification_preferences: %{message: false}}} -> false
      %{notification_preferences: %{message: true}} -> true
      _ -> false
    end)
    |> Enum.map(& {:message, &1.user_id})
    |> Enum.concat(mentions)
  end

  def actor(%{item: %{creator: user}}), do: user

  defp get_participants(conversation_id) do
    Participant.for_conversation(conversation_id)
    |> Participant.preload([:user])
    |> Core.Repo.all()
  end

  defp filter_mentions(entities, participants_by_user) do
    entities
    |> Enum.map(& {&1, participants_by_user[&1.user_id]})
    |> Enum.filter(fn
      {%{user: %{notification_preferences: %{mention: false}}}, _} -> false
      {_, %{notification_preferences: %{mention: false}}} -> false
      _ -> true
    end)
    |> Enum.map(fn {%{user_id: user_id}, _} -> {:mention, user_id} end)
  end
end