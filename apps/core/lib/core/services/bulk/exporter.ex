defmodule Core.Services.Exporter do
  alias Core.Models.{Conversation, Message}

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

  def export_json() do
    stream_conversations()
    |> Stream.map(fn %{name: name} = conv ->
      Zstream.entry("#{name}.json", stream_messages(conv) |> Stream.map(& "#{Jason.encode!(&1)}\n"))
    end)
    |> Zstream.zip(zip64: true)
  end
end