defmodule RtcWeb.ConversationChannel do
  use RtcWeb, :channel
  alias Core.Services.Conversations
  alias Thrift.Generated.Service.Binary.Framed.Client
  alias Thrift.Generated.PingParticipant
  alias Rtc.GqlClient

  def join("conversation:" <> id, _params, socket) do
    socket = assign(socket, :conversation_id, id)
    with {:ok, _conv} <- Conversations.authorize(id, socket.assigns[:user], :access) do
      {:ok, socket}
    end
  end

  def handle_info(_, socket) do
    {:noreply, socket}
  end

  def handle_in("typing", _, socket) do
    broadcast!(socket, "typing", %{handle: socket.assigns.user.handle})
    {:noreply, socket}
  end

  def handle_in("ping", _, socket) do
    Client.ping_participant(GqlClient, %PingParticipant{
      conversation_id: socket.assigns.conversation_id,
      user_id: socket.assigns.user.id
    })
    {:reply, :ok, socket}
  end
end