defmodule Core.Services.Exporter do
  alias Core.Models.{
    Conversation,
    Message,
    Participant
  }

  def stream_conversations() do
    Conversation.nonchat()
    |> Conversation.ordered(asc: :id)
    |> Core.Repo.stream(method: :keyset)
  end

  def stream_messages(%Conversation{id: id}) do
    Message.for_conversation(id)
    |> Message.preload()
    |> Message.ordered(asc: :id)
    |> Core.Repo.stream(method: :keyset)
  end

  def stream_participants(%Conversation{id: id}) do
    Participant.for_conversation(id)
    |> Participant.ordered()
    |> Participant.preload([:user])
    |> Core.Repo.stream(method: :keyset)
  end

  def export_json() do
    workspace_exporter("json", fn conv ->
      stream_messages(conv)
      |> Stream.map(& "#{Jason.encode!(&1)}\n")
    end)
  end

  def export_participants() do
    workspace_exporter("csv", fn conv ->
      stream_participants(conv)
      |> Stream.map(& %{
        conversation: &1.conversation_id,
        email: &1.user.email,
        handle: &1.user.handle,
        notification_preferences: Jason.encode!(&1.notification_preferences)
      })
      |> CSV.encode(headers: ~w(conversation email handle notification_preferences)a)
    end)
  end

  defp workspace_exporter(ext, entry_func) do
    stream_conversations()
    |> Stream.map(fn %Conversation{name: name} = conv ->
      Zstream.entry("#{name}.#{ext}", entry_func.(conv))
    end)
    |> Zstream.zip(zip64: true)
  end
end