defmodule RtcWeb.LobbyChannel do
  use RtcWeb, :channel
  alias Rtc.Presence
  @gc_interval 30_000

  def join("lobby", _params, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end

  def handle_info(:after_join, socket) do
    :timer.send_interval(@gc_interval, :gc)
    push(socket, "presence_state", Presence.list(socket))
    {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{
      online_at: inspect(System.system_time(:second))
    })
    {:noreply, socket}
  end

  def handle_info(:gc, socket) do
    send(socket.transport_pid, :garbage_collect)
    {:noreply, socket}
  end
end