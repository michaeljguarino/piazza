defmodule(Thrift.Generated.PubSubEvent) do
  @moduledoc(false)
  _ = "Auto-generated Thrift struct core.PubSubEvent"
  _ = "1: string event"
  defstruct(event: nil)
  @type(t :: %__MODULE__{})
  def(new) do
    %__MODULE__{}
  end
  defmodule(BinaryProtocol) do
    @moduledoc(false)
    def(deserialize(binary)) do
      deserialize(binary, %Thrift.Generated.PubSubEvent{})
    end
    defp(deserialize(<<0, rest::binary>>, %Thrift.Generated.PubSubEvent{} = acc)) do
      {acc, rest}
    end
    defp(deserialize(<<11, 1::16-signed, string_size::32-signed, value::binary-size(string_size), rest::binary>>, acc)) do
      deserialize(rest, %{acc | event: value})
    end
    defp(deserialize(<<field_type, _id::16-signed, rest::binary>>, acc)) do
      rest |> Thrift.Protocol.Binary.skip_field(field_type) |> deserialize(acc)
    end
    defp(deserialize(_, _)) do
      :error
    end
    def(serialize(%Thrift.Generated.PubSubEvent{event: event})) do
      [case(event) do
        nil ->
          <<>>
        _ ->
          [<<11, 1::16-signed, byte_size(event)::32-signed>> | event]
      end | <<0>>]
    end
  end
  def(serialize(struct)) do
    BinaryProtocol.serialize(struct)
  end
  def(serialize(struct, :binary)) do
    BinaryProtocol.serialize(struct)
  end
  def(deserialize(binary)) do
    BinaryProtocol.deserialize(binary)
  end
end