defmodule Rtc.ServiceHandler do
  @behaviour Thrift.Generated.RtcService.Handler
  alias Thrift.Generated.{
    PubSubEvent, 
    ActiveUserRequest, 
    ActiveUsers, 
    ActiveUser
  }

  def publish_event(%PubSubEvent{event: event}) do
    event = :erlang.binary_to_term(event)
    with {object, topics} <- Rtc.Channels.Negotiator.negotiate(event),
      do: Absinthe.Subscription.publish(RtcWeb.Endpoint, object, topics)
    true
  end

  def list_active(%ActiveUserRequest{scope: "lobby"}) do
    active = Rtc.Presence.list("lobby") |> Map.keys()
    
    %ActiveUsers{
      active_users: Enum.map(active, & %ActiveUser{user_id: &1})
    }
  end
end