defmodule RtcWeb.UserSocket do
  use Phoenix.Socket
  use Absinthe.Phoenix.Socket,
    schema: Core.Schema

  def connect(params, socket) do
    socket = Absinthe.Phoenix.Socket.put_options(socket, context: build_context(params))

    {:ok, socket}
  end

  def build_context(%{"token" => "Bearer " <> token}) do
    {:ok, current_user, _claims} = Rtc.Guardian.resource_from_token(token)
    %{current_user: current_user}
  end
  def build_context(_), do: %{current_user: nil}

  def id(_socket), do: nil
end
