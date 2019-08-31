defmodule Core.Services.Emoji do
  use Core.Services.Base
  alias Core.Models.Emoji

  import Core.Policies.Emoji

  def create_emoji(attrs, user) do
    %Emoji{creator_id: user.id}
    |> Emoji.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
    |> notify(:create)
  end

  defp notify(result, _), do: result
end