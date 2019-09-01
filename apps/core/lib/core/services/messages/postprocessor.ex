defmodule Core.Services.Messages.PostProcessor do
  import Core.Services.Base, only: [timestamped: 1]
  alias Core.Models.User

  @mention_regex ~r/\@[a-zA-Z0-9]+/
  @emoji_regex ~r/:[\w]+:/
  @max_entities 25

  @doc """
  Extracts all valid handles from message text and
  inflates them into a {{pos, length}, user} tuple.

  If a handle matches the supplied user, it is ignored
  (so don't mention yourself)
  """
  def extract_entities(text, user) do
    mentions = extract_mentions(text, user)
    emoji = extract_emoji(text)
    mention_entities = for {{pos, len}, user} <- mentions do
      timestamped(%{
        user_id: user.id,
        type: :mention,
        start_index: pos,
        length: len
      })
    end
    emoji_entities = for {emoji, {pos, len}} <- emoji do
      timestamped(%{
        type: :emoji,
        length: len,
        start_index: pos,
        text: emoji
      })
    end

    mention_entities ++ emoji_entities
  end

  defp extract_emoji(text) do
    Regex.scan(@emoji_regex, text, return: :index)
    |> Enum.map(fn [{first, length} = post_len] ->
      {:binary.part(text, {first + 1, length - 2}), post_len}
    end)
  end

  defp extract_mentions(text, %User{handle: handle}) do
    Regex.scan(@mention_regex, text, return: :index)
    |> Enum.map(fn [{first, length} = post_len] ->
      {:binary.part(text, {first + 1, length - 1}), post_len}
    end)
    |> Enum.filter(fn
      ^handle -> false
      _ -> true
    end)
    |> Enum.take(@max_entities)
    |> Map.new()
    |> inflate_users()
  end

  defp inflate_users(handle_map) do
    users =
      Map.keys(handle_map)
      |> User.with_handles()
      |> Core.Repo.all()
      |> Enum.into(%{}, & {&1.handle, &1})

    users
    |> Enum.map(fn {handle, user} ->
      {handle_map[handle], user}
    end)
  end
end