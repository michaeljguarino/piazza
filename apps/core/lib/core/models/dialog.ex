defmodule Core.Models.Dialog do
  alias Core.Models.StructuredMessage

  @type t :: %__MODULE__{}

  defstruct [
    :structured_message,
    :anchor_message,
    :user
  ]

  def build_dialog(structured_message, anchor, user) do
    with {:ok, map} <- StructuredMessage.Type.cast(structured_message) do
      {:ok, %__MODULE__{
        structured_message: map,
        anchor_message: hydrate_message(anchor),
        user: hydrate_user(user)
      }}
    end
  end

  defp hydrate_user(user_id) when is_binary(user_id),
    do: Core.Services.Users.get_user(user_id)
  defp hydrate_user(%{} = user), do: user

  defp hydrate_message(message_id) when is_binary(message_id),
    do: Core.Services.Conversations.get_message!(message_id)
  defp hydrate_message(%{} = msg), do: msg
end