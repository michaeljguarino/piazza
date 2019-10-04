defmodule Core.PubSub.Participants do
  @moduledoc """
  Modifies the pariticpants in a conversation in response to
  various events
  """
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 10
  alias Core.Models.Participant

  alias Core.Services.Conversations

  def handle_event(event) do
    with {conv_id, user_id, actor_id} <- Core.PubSub.Invitable.invite(event),
         participant <- Conversations.get_participant(user_id, conv_id) do
      maybe_insert(participant, user_id, conv_id, actor_id)
    end
  end

  defp maybe_insert(nil, user_id, conv_id, actor_id) do
    actor = Core.Services.Users.get_user(actor_id)

    Conversations.create_participant(%{
      conversation_id: conv_id,
      user_id: user_id
    }, actor)
  end

  defp maybe_insert(%Participant{deleted_at: del} = participant, _, conv_id, _) when not is_nil(del) do
    %{user: user} = Core.Repo.preload(participant, [:user])
    Conversations.upsert_participant(conv_id, user)
  end

  defp maybe_insert(_, _, _, _), do: :ok
end