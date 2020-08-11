defmodule Core.Services.Messages.PostProcessor do
  import Core.Services.Base, only: [timestamped: 1]
  alias Core.Models.{User, Emoji}

  @mention_regex ~r/\@[a-zA-Z0-9]+/
  @emoji_regex ~r/:[a-zA-Z0-9\+_\-]+:/
  @max_entities 25

  @doc """
  Extracts all valid handles from message text and
  inflates them into a {{pos, length}, user} tuple.

  If a handle matches the supplied user, it is ignored
  (so don't mention yourself)
  """
  def extract_entities(text, user) do
    bare_mentions = extract_mentions(text, user)
    emoji = extract_emoji(text)

    mention_entities = for {user, handle, {pos, len}} <- inflate_users(bare_mentions) do
      timestamped(%{
        user_id: user.id,
        type: :mention,
        start_index: pos,
        length: len,
        text: handle
      })
    end

    emoji_entities = for {emoji, name, {pos, len}} <- emoji do
      timestamped(%{
        type: :emoji,
        length: len,
        start_index: pos,
        text: name,
        emoji_id: emoji && emoji.id
      })
    end

    channel_mentions(bare_mentions) ++ mention_entities ++ emoji_entities
  end

  defp channel_mentions(bare_mentions) do
    bare_mentions
    |> Enum.filter(fn
      {"here", _} -> true
      {"all", _} -> true
      _ -> false
    end)
    |> Enum.map(fn {text, {pos, len}} ->
      timestamped(%{
        type: :channel_mention,
        length: len,
        start_index: pos,
        text: text
      })
    end)
  end

  defp extract_emoji(text) do
    Regex.scan(@emoji_regex, text, return: :index)
    |> Enum.map(fn [{first, length} = post_len] ->
      {:binary.part(text, {first + 1, length - 2}), post_len}
    end)
    |> Enum.take(@max_entities)
    |> inflate_emoji()
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
  end

  defp inflate_users(mention_entities) do
    user_map =
      Enum.map(mention_entities, &elem(&1, 0))
      |> User.with_handles()
      |> Core.Repo.all()
      |> Enum.into(%{}, & {&1.handle, &1})

    mention_entities
    |> Enum.map(fn {handle, position} ->
      {user_map[handle], handle, position}
    end)
    |> Enum.filter(fn {user, _, _} -> user end)
  end

  defp inflate_emoji(emoji_entities) do
    emoji_map =
      Enum.map(emoji_entities, &elem(&1, 0))
      |> Emoji.with_names()
      |> Core.Repo.all()
      |> Enum.into(%{}, & {&1.name, &1})

    emoji_entities
    |> Enum.map(fn {name, pos} -> {emoji_map[name], name, pos} end)
  end
end