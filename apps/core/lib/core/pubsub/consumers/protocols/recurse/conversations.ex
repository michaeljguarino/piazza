defimpl Core.Recurse.Traversable, for: Core.PubSub.MessageCreated do
  @moduledoc """
  The call path is a little complex for this.  Basically we do:

  1. Ensure it's actually a valid command (preceded by "/", not a bot sender)
  2. Fetch the command and preload everything
  3. Send it to the webhook q
  4. Core.Aquaduct.WebhookSubscriber picks it up, and calls Core.Services.Platform.Webhooks.send_hook
  """
  alias Core.Services.Platform
  alias Core.Models.{Command}
  alias Core.Utils.Url

  def traverse(%{item: %{text: text} = message, actor: actor} = event) do
    parse_command(event)
    Url.find_urls(text)
    |> unfurl_urls(message, actor)
  end

  def unfurl_urls(_, %{embed: %{title: t}}, _) when not is_nil(t), do: :ok
  def unfurl_urls([url | _], message, user) do
    with {:ok, furlex} <- Furlex.unfurl(url),
         {:ok, embed} <- Core.Models.Embed.from_furlex(furlex) do
      Core.Services.Conversations.create_message(
        message.conversation_id,
        %{text: embed.title, embed: embed},
        user
      )
    end
  end
  def unfurl_urls(_, _, _), do: :ok

  def parse_command(%{actor: %{bot: true}}), do: :ok # prevent recursive commands
  def parse_command(%{item: %{text: "/" <> text} = msg}) do
    with [command | _] <- String.split(text, " "),
         %Command{} = c <- Platform.get_command(command),
         %{webhook: webhook, bot: bot} <- Core.Repo.preload(c, [:webhook, :bot]) do
      payload = {webhook, bot, Core.Repo.preload(msg, [:creator, :conversation])}
      Core.Aquaduct.Broker.publish(%Conduit.Message{body: payload}, :webhook)
    end
  end
  def parse_command(_), do: :ok
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
        on_conflict: :replace_all_except_primary_key
      )
      |> elem(0)
    end)
    |> Enum.sum()
  end
  def traverse(_), do: :ok

  defp build_update(%{id: user_id}, conv_id),
    do: timestamped(%{conversation_id: conv_id, user_id: user_id})
end