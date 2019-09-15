defmodule Core.Services.Emoji do
  use Core.Services.Base
  alias Core.PubSub
  alias Core.Models.Emoji

  import Core.Policies.Emoji

  def create_emoji(attrs, user) do
    %Emoji{creator_id: user.id}
    |> Emoji.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
    |> notify(:create, user)
  end

  defp notify({:ok, %Emoji{} = emoji}, :create, actor), 
    do: handle_notify(PubSub.EmojiCreated, emoji, actor: actor)
  defp notify(result, _, _), do: result
end