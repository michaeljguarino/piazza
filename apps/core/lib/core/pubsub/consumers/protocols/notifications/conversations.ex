defmodule Core.Notifications.ChannelMention do
  alias Core.RtcClient
  alias Thrift.Generated.{ActiveUserRequest, ActiveUsers}

  defstruct [
    :here,
    :all,
    :user_ids
  ]

  def compile(entities) do
    entities
    |> Enum.filter(& &1.type == :channel_mention)
    |> Enum.reduce(%__MODULE__{}, fn
      %{text: "here"}, compiled -> %{compiled | here: true}
      %{text: "all"}, compiled -> %{compiled | all: true}
      _, compiled -> compiled
    end)
    |> hydrate()
  end

  def hydrate(%{here: true} = channel_mention) do
    {:ok, %ActiveUsers{active_users: actives}} = RtcClient.rpc(:list_active, %ActiveUserRequest{scope: "lobby"})

    %{channel_mention | user_ids: Enum.map(actives, & &1.user_id) |> MapSet.new()}
  end
  def hydrate(channel_mention), do: channel_mention
end

defimpl Core.Notifications.Notifiable, for: Core.PubSub.MessageCreated do
  alias Core.Models.Participant
  alias Core.Notifications.ChannelMention

  def preload(%{item: msg} = event),
    do: {:ok, %{event | item: Core.Repo.preload(msg, [:creator, [entities: :user]])}}

  def message(%{item: msg}), do: msg

  def notifs(%{item: %{entities: entities} = msg}) do
    participants = get_participants(msg.conversation_id)
    by_user      = Enum.into(participants, %{}, & {&1.user_id, &1})
    mentions     = filter_mentions(entities, by_user)

    mentioned_users = Enum.map(entities, & &1.user_id) |> MapSet.new()
    channel_mentions = ChannelMention.compile(entities)

    participants
    |> Enum.filter(& &1.user_id not in mentioned_users)
    |> Enum.filter(& &1.user_id != msg.creator_id)
    |> Enum.filter(&filter_participant(&1, channel_mentions))
    |> Enum.map(& {notif_type(channel_mentions), &1.user_id})
    |> Enum.concat(mentions)
  end

  def actor(%{item: %{creator: user}}), do: user

  defp get_participants(conversation_id) do
    Participant.for_conversation(conversation_id)
    |> Participant.preload([:user])
    |> Core.Repo.all()
  end

  defp notif_type(%{all: true}), do: :mention
  defp notif_type(%{here: true}), do: :mention
  defp notif_type(_), do: :message

  defp filter_participant(%{user: %{notification_preferences: %{message: false}}}, _), do: false
  defp filter_participant(%{notification_preferences: %{message: true}}, _), do: true
  defp filter_participant(_, %{all: true}), do: true
  defp filter_participant(%{user: %{id: id}}, %{here: true, user_ids: user_ids}), 
    do: id in user_ids
  defp filter_participant(_, _), do: false

  defp filter_mentions(entities, participants_by_user) do
    entities
    |> Enum.filter(& &1.type == :mention)
    |> Enum.map(& {&1, participants_by_user[&1.user_id]})
    |> Enum.filter(fn
      {%{user: %{notification_preferences: %{mention: false}}}, _} -> false
      {_, %{notification_preferences: %{mention: false}}} -> false
      _ -> true
    end)
    |> Enum.map(fn {%{user_id: user_id}, _} -> {:mention, user_id} end)
  end
end