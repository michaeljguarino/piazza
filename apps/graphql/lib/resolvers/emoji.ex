defmodule GraphQl.Resolvers.Emoji do
  use GraphQl.Resolvers.Base, model: Core.Models.Emoji
  alias Core.Services.Emoji, as: EmojiService
  alias Core.Models.Emoji

  def create_emoji(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: EmojiService.create_emoji(attrs, user)

  def list_emoji(args, _) do
    Emoji.ordered()
    |> paginate(args)
  end
end