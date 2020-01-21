defmodule Rtc.Piazza.Server do
  use GRPC.Server, service: Core.PiazzaRtc.Service
  alias Core.{ActiveUsersRequest, ActiveUsers, ActiveUser}

  @spec list_active(ActiveUsersRequest.t, GRPC.Server.Stream.t) :: ActiveUsers.t
  def list_active(%ActiveUsersRequest{scope: "lobby"}, _) do
    active = Rtc.Presence.list("lobby") |> Map.keys()

    ActiveUsers.new(active_users: Enum.map(active, &ActiveUser.new(user_id: &1)))
  end
end


defmodule Rtc.Piazza.Endpoint do
  use GRPC.Endpoint

  intercept GRPC.Logger.Server
  run Rtc.Piazza.Server
end