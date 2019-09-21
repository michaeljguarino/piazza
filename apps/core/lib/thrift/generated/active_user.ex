defmodule(Thrift.Generated.ActiveUser) do
  @moduledoc(false)
  _ = "Auto-generated Thrift struct core.ActiveUser"
  _ = "1: string user_id"
  defstruct(user_id: nil)
  @type(t :: %__MODULE__{})
  def(new) do
    %__MODULE__{}
  end
  defmodule(BinaryProtocol) do
    @moduledoc(false)
    def(deserialize(binary)) do
      deserialize(binary, %Thrift.Generated.ActiveUser{})
    end
    defp(deserialize(<<0, rest::binary>>, %Thrift.Generated.ActiveUser{} = acc)) do
      {acc, rest}
    end
    defp(deserialize(<<11, 1::16-signed, string_size::32-signed, value::binary-size(string_size), rest::binary>>, acc)) do
      deserialize(rest, %{acc | user_id: value})
    end
    defp(deserialize(<<field_type, _id::16-signed, rest::binary>>, acc)) do
      rest |> Thrift.Protocol.Binary.skip_field(field_type) |> deserialize(acc)
    end
    defp(deserialize(_, _)) do
      :error
    end
    def(serialize(%Thrift.Generated.ActiveUser{user_id: user_id})) do
      [case(user_id) do
        nil ->
          <<>>
        _ ->
          [<<11, 1::16-signed, byte_size(user_id)::32-signed>> | user_id]
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