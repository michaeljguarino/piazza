defmodule RtcWeb.ConversationChannel do
  use RtcWeb, :channel
  alias Core.Services.Conversations

  def join("conversation:" <> id, _params, socket) do
    with {:ok, _conv} <- Conversations.authorize(id, socket.assigns[:user], :access) do
      {:ok, socket}
    end
  end

  def handle_in("typing", _, socket) do
    broadcast!(socket, "typing", %{handle: socket.assigns.user.handle})
    {:noreply, socket}
  end
end