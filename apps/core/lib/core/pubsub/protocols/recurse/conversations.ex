defimpl Core.Recurse.Traversable, for: Core.PubSub.MessageCreated do
  alias Core.Utils.Url
  alias Core.Services.Platform

  def traverse(%{item: %{text: text} = message, actor: actor}) do
    custom_unfurlers(message, actor)

    Url.find_urls(text)
    |> unfurl_urls(message, actor)
  end

  def unfurl_urls(_, %{embed: %{url: t}}, _) when not is_nil(t), do: :ok
  def unfurl_urls([url | _], message, user) do
    with {:ok, furlex} <- Core.Utils.Url.unfurl(url),
         {:ok, embed}  <- Core.Models.Embed.from_furlex(furlex) do
      Core.Services.Conversations.create_message(
        message.conversation_id,
        %{text: text(embed), embed: embed},
        user
      )
    end
  end
  def unfurl_urls(_, _, _), do: :ok

  defp custom_unfurlers(%{embed: %{url: u, title: t}}, _) when not is_nil(u) or not is_nil(t), do: :ok
  defp custom_unfurlers(%{text: text} = message, actor) do
    Platform.get_unfurlers()
    |> Enum.filter(fn %{compiled: compiled} -> Regex.match?(compiled, text) end)
    |> Enum.each(fn %{compiled: compiled, command: command} ->
      matches = Regex.scan(compiled, text) |> Enum.concat()
      Core.Aquaduct.Broker.publish(%Conduit.Message{body: {message, matches, command, actor}}, :unfurl)
    end)
  end

  defp text(%{title: title}), do: title
  defp text(%{description: description}), do: description
  defp text(%{url: url}), do: url
end

defimpl Core.Recurse.Traversable, for: Core.PubSub.ConversationCreated do
  import Core.Services.Base, only: [timestamped: 1]
  alias Core.Models.{User, Participant}

  def traverse(%{item: %{id: conv_id, global: true}}) do
    User
    |> User.ordered(asc: :id)
    |> Core.Repo.stream(method: :keyset)
    |> Stream.chunk_every(50)
    |> Flow.from_enumerable(stages: 5, max_demand: 5)
    |> Flow.map(fn chunk ->
      records = Enum.map(chunk, &build_update(&1, conv_id))

      Core.Repo.insert_all(Participant, records,
        conflict_target: [:user_id, :conversation_id],
        on_conflict: {:replace_all_except, [:id]}
      )
      |> elem(0)
    end)
    |> Enum.sum()
  end
  def traverse(_), do: :ok

  defp build_update(%{id: user_id}, conv_id),
    do: timestamped(%{conversation_id: conv_id, user_id: user_id})
end