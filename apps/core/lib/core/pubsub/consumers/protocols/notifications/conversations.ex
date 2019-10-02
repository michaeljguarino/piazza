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
  alias Core.Services.Conversations
  alias Core.Notifications.ChannelMention

  def preload(%{item: msg} = event),
    do: {:ok, %{event | item: Core.Repo.preload(msg, [:creator, [entities: :user]])}}

  def message(%{item: msg}), do: msg

  def notifs(%{item: %{entities: entities} = msg}) do
    mentions     = mentions_by_user(entities)
    channel_mentions = ChannelMention.compile(entities)

    Conversations.get_participants(msg.conversation_id)
    |> Stream.filter(& &1.user_id != msg.creator_id)
    |> Enum.reduce({[], mentions}, fn %{user_id: uid} = participant, {notifs, remaining} ->
      remaining = Map.delete(remaining, uid)
      case notif(participant, mentions[uid], channel_mentions) do
        nil -> {notifs, remaining}
        notif -> {[notif | notifs], remaining}
      end
    end)
    |> combine()
  end

  defp combine({notifs, remaining}) do
    notifs ++ Enum.map(remaining, fn {uid, type} -> {type, uid} end)
  end

  def actor(%{item: %{creator: user}}), do: user

  defp notif(participant, mention, channel_mentions) do
    with nil <- mention_notif(participant, mention),
      do: message_notif(participant, channel_mentions)
  end

  defp mention_notif(_, nil), do: nil
  defp mention_notif(%{notification_preferences: %{mention: false}}, _),
    do: nil
  defp mention_notif(%{user_id: user_id}, type), do: {type, user_id}

  defp message_notif(%{user: %{notification_preferences: %{message: false}}}, _), do: nil
  defp message_notif(%{user_id: user_id}, %{all: true}), do: {:mention, user_id}
  defp message_notif(%{user_id: user_id, notification_preferences: %{message: true}}, channel),
    do: {notif_type(channel), user_id}
  defp message_notif(%{user_id: user_id}, %{here: true, user_ids: user_ids}) do
    case Enum.member?(user_ids, user_id) do
      true -> {:mention, user_id}
      _ -> nil
    end
  end
  defp message_notif(_, _), do: nil

  defp notif_type(%{all: true}), do: :mention
  defp notif_type(%{here: true}), do: :mention
  defp notif_type(_), do: :message

  defp mentions_by_user(entities) do
    entities
    |> Enum.filter(& &1.type == :mention)
    |> Enum.filter(fn
      %{user: %{notification_preferences: %{mention: false}}} -> false
      _ -> true
    end)
    |> Enum.into(%{}, fn %{user_id: user_id} -> {user_id, :mention} end)
    # |> Enum.map(& {&1, participants_by_user[&1.user_id]})
    # |> Enum.filter(fn
    #   {%{user: %{notification_preferences: %{mention: false}}}, _} -> false
    #   {_, %{notification_preferences: %{mention: false}}} -> false
    #   _ -> true
    # end)
    # |> Enum.map(fn {%{user_id: user_id}, _} -> {:mention, user_id} end)
  end
end