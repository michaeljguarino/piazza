defmodule RtcWeb.ConversationChannel do
  use RtcWeb, :channel
  alias Core.Services.Conversations
  alias Core.{PingConversationRequest, LeaveConversationRequest}

  @ping_interval 120_000

  def join("conversation:" <> id, _params, socket) do
    socket = assign(socket, :conversation_id, id)
    with {:ok, _conv} <- Conversations.authorize(id, socket.assigns[:user], :access) do
      send(self(), :after_join)
      {:ok, socket}
    end
  end

  def handle_info(:after_join, socket) do
    ping(socket)
    :timer.send_interval(@ping_interval, :ping)
    {:noreply, socket}
  end

  def handle_info(:ping, socket) do
    ping(socket)
    {:noreply, socket}
  end
  def handle_info(_, socket), do: {:noreply, socket}

  def handle_in("typing", _, socket) do
    broadcast!(socket, "typing", %{handle: socket.assigns.user.handle})
    {:noreply, socket}
  end

  def handle_in("ping", _, socket) do
    {:reply, :ok, socket}
  end

def terminate(_, %{topic: "conversation:" <> id} = socket) do
  with {:ok, chan} <- Rtc.GqlClient.chan() do
    Core.Piazza.Stub.leave_conversation(chan, LeaveConversationRequest.new(
      conversation_id: id,
      user_id: socket.assigns.user_id
    ))
  end
end

  defp ping(socket) do
    with {:ok, chan} <- Rtc.GqlClient.chan() do
      Core.Piazza.Stub.ping_conversation(chan, PingConversationRequest.new(
        conversation_id: socket.assigns.conversation_id,
        user_id: socket.assigns.user.id
      ))
    end
  end
end