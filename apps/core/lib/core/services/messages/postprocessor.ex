defmodule Core.Services.Messages.PostProcessor do
  alias Core.Models.User

  @mention_regex ~r/\@[a-zA-Z0-9]+/
  @max_entities 25

  @doc """
  Extracts all valid handles from message text and
  inflates them into a {{pos, length}, user} tuple.

  If a handle matches the supplied user, it is ignored
  (so don't mention yourself)
  """
  def extract_entities(text, %User{handle: handle}) do
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
      {handle, {handle_map[handle], user}}
    end)
    |> Map.new()
  end
end