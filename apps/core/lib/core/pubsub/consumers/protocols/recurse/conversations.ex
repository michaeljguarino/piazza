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

  def traverse(%{actor: %{bot: true}}), do: :ok # prevent recursive commands
  def traverse(%{item: %{text: "/" <> text} = msg}) do
    with [command | _] <- String.split(text, " "),
         %Command{} = c <- Platform.get_command(command),
         %{webhook: webhook, bot: bot} <- Core.Repo.preload(c, [:webhook, :bot]) do
      payload = {webhook, bot, Core.Repo.preload(msg, [:creator, :conversation])}
      Core.Aquaduct.Broker.publish(%Conduit.Message{body: payload}, :webhook)
    end
  end
  def traverse(_), do: :ok
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