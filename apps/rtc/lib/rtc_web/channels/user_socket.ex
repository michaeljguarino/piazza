defmodule RtcWeb.UserSocket do
  use Phoenix.Socket
  use Absinthe.Phoenix.Socket,
    schema: Core.Schema

  def connect(params, socket) do
    socket = Absinthe.Phoenix.Socket.put_options(socket, context: build_context(params))

    {:ok, socket}
  end

  def build_context(params) do
    with {:ok, token} <- fetch_token(params) do
      {:ok, current_user, _claims} = Core.Guardian.resource_from_token(token)
      %{current_user: current_user}
    else
      _ -> %{current_user: nil}
    end
  end

  def fetch_token(%{"Authorization" => "Bearer " <> token}), do: {:ok, token}
  def fetch_token(%{"token" => "Bearer " <> token}), do: {:ok, token}
  def fetch_token(_), do: {:error, :notoken}

  def id(_socket), do: nil
end
