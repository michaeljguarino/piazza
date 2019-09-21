defmodule(Thrift.Generated.ActiveUsers) do
  @moduledoc(false)
  _ = "Auto-generated Thrift struct core.ActiveUsers"
  _ = "1: list<core.ActiveUser> active_users"
  defstruct(active_users: nil)
  @type(t :: %__MODULE__{})
  def(new) do
    %__MODULE__{}
  end
  defmodule(BinaryProtocol) do
    @moduledoc(false)
    def(deserialize(binary)) do
      deserialize(binary, %Thrift.Generated.ActiveUsers{})
    end
    defp(deserialize(<<0, rest::binary>>, %Thrift.Generated.ActiveUsers{} = acc)) do
      {acc, rest}
    end
    defp(deserialize(<<15, 1::16-signed, 12, remaining::32-signed, rest::binary>>, struct)) do
      deserialize__active_users(rest, [[], remaining, struct])
    end
    defp(deserialize(<<field_type, _id::16-signed, rest::binary>>, acc)) do
      rest |> Thrift.Protocol.Binary.skip_field(field_type) |> deserialize(acc)
    end
    defp(deserialize(_, _)) do
      :error
    end
    defp(deserialize__active_users(<<rest::binary>>, [list, 0, struct])) do
      deserialize(rest, %{struct | active_users: Enum.reverse(list)})
    end
    defp(deserialize__active_users(<<rest::binary>>, [list, remaining | stack])) do
      case(Elixir.Thrift.Generated.ActiveUser.BinaryProtocol.deserialize(rest)) do
        {element, rest} ->
          deserialize__active_users(rest, [[element | list], remaining - 1 | stack])
        :error ->
          :error
      end
    end
    defp(deserialize__active_users(_, _)) do
      :error
    end
    def(serialize(%Thrift.Generated.ActiveUsers{active_users: active_users})) do
      [case(active_users) do
        nil ->
          <<>>
        _ ->
          [<<15, 1::16-signed, 12, length(active_users)::32-signed>> | for(e <- active_users) do
            Thrift.Generated.ActiveUser.serialize(e)
          end]
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