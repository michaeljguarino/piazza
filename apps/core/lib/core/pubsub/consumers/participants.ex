defmodule Core.PubSub.Participants do
  use Piazza.PubSub.Consumer, 
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 10
  
  alias Core.Services.Conversations
  
  def handle_event(event) do
    with {conv_id, user_id, actor_id} <- Core.PubSub.Invitable.invite(event),
         nil <- Conversations.get_participant(user_id, conv_id) do
      actor = Core.Services.Users.get_user(actor_id)

      Conversations.create_participant(%{
        conversation_id: conv_id,
        user_id: user_id
      }, actor)
    end
  end
end