defimpl Core.PubSub.Webhook, for: Core.PubSub.MessageCreated do
  alias Core.Services.Platform
  alias Core.Models.Command

  def command(event), do: parse_command(event)

  def payload(%{item: message}) do
    Core.Repo.preload(message, [:creator, :conversation])
    |> Jason.encode!()
  end

  def message(%{item: message}),
    do: message

  def queue(_), do: :webhook

  defp parse_command(%{actor: %{bot: true}}), do: :ok # prevent recursive commands
  defp parse_command(%{item: %{text: "/" <> text}}) do
    with [command | _]  <- String.split(text, " "),
         %Command{} = c <- Platform.get_command(command) do
      {:ok, Core.Repo.preload(c, [:webhook, :bot])}
    else
      _ -> :ok
    end
  end
  defp parse_command(_), do: :ok
end

defimpl Core.PubSub.Webhook, for: Core.PubSub.InteractionDispatched do
  def command(%{item: %{command: command}}), do: {:ok, command}

  def payload(%{item: %{payload: payload}}), do: payload

  def message(%{item: %{message: message}}), do: message

  def queue(_), do: :interaction
end