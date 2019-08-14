defmodule(Thrift.Generated.GqlService) do
  @moduledoc(false)
  defmodule(PingParticipantArgs) do
    @moduledoc(false)
    _ = "Auto-generated Thrift struct Elixir.PingParticipantArgs"
    _ = "-1: core.PingParticipant request"
    defstruct(request: nil)
    @type(t :: %__MODULE__{})
    def(new) do
      %__MODULE__{}
    end
    defmodule(BinaryProtocol) do
      @moduledoc(false)
      def(deserialize(binary)) do
        deserialize(binary, %PingParticipantArgs{})
      end
      defp(deserialize(<<0, rest::binary>>, %PingParticipantArgs{} = acc)) do
        {acc, rest}
      end
      defp(deserialize(<<12, -1::16-signed, rest::binary>>, acc)) do
        case(Elixir.Thrift.Generated.PingParticipant.BinaryProtocol.deserialize(rest)) do
          {value, rest} ->
            deserialize(rest, %{acc | request: value})
          :error ->
            :error
        end
      end
      defp(deserialize(<<field_type, _id::16-signed, rest::binary>>, acc)) do
        rest |> Thrift.Protocol.Binary.skip_field(field_type) |> deserialize(acc)
      end
      defp(deserialize(_, _)) do
        :error
      end
      def(serialize(%PingParticipantArgs{request: request})) do
        [case(request) do
          nil ->
            <<>>
          _ ->
            [<<12, -1::16-signed>> | Thrift.Generated.PingParticipant.serialize(request)]
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
  defmodule(PingParticipantResponse) do
    @moduledoc(false)
    _ = "Auto-generated Thrift struct Elixir.PingParticipantResponse"
    _ = "0: bool success"
    defstruct(success: nil)
    @type(t :: %__MODULE__{})
    def(new) do
      %__MODULE__{}
    end
    defmodule(BinaryProtocol) do
      @moduledoc(false)
      def(deserialize(binary)) do
        deserialize(binary, %PingParticipantResponse{})
      end
      defp(deserialize(<<0, rest::binary>>, %PingParticipantResponse{} = acc)) do
        {acc, rest}
      end
      defp(deserialize(<<2, 0::16-signed, 1, rest::binary>>, acc)) do
        deserialize(rest, %{acc | success: true})
      end
      defp(deserialize(<<2, 0::16-signed, 0, rest::binary>>, acc)) do
        deserialize(rest, %{acc | success: false})
      end
      defp(deserialize(<<field_type, _id::16-signed, rest::binary>>, acc)) do
        rest |> Thrift.Protocol.Binary.skip_field(field_type) |> deserialize(acc)
      end
      defp(deserialize(_, _)) do
        :error
      end
      def(serialize(%PingParticipantResponse{success: success})) do
        [case(success) do
          nil ->
            <<>>
          false ->
            <<2, 0::16-signed, 0>>
          true ->
            <<2, 0::16-signed, 1>>
          _ ->
            raise(Thrift.InvalidValueError, "Optional boolean field :success on PingParticipantResponse must be true, false, or nil")
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
  defmodule(Binary.Framed.Client) do
    @moduledoc(false)
    alias(Thrift.Binary.Framed.Client, as: ClientImpl)
    defdelegate(close(conn), to: ClientImpl)
    defdelegate(connect(conn, opts), to: ClientImpl)
    defdelegate(start_link(host, port, opts \\ []), to: ClientImpl)
    def(unquote(:ping_participant)(client, request, rpc_opts \\ [])) do
      args = %PingParticipantArgs{request: request}
      serialized_args = PingParticipantArgs.BinaryProtocol.serialize(args)
      ClientImpl.call(client, "pingParticipant", serialized_args, PingParticipantResponse.BinaryProtocol, rpc_opts)
    end
    def(unquote(:ping_participant!)(client, request, rpc_opts \\ [])) do
      case(unquote(:ping_participant)(client, request, rpc_opts)) do
        {:ok, rsp} ->
          rsp
        {:error, {:exception, ex}} ->
          raise(ex)
        {:error, reason} ->
          raise(Thrift.ConnectionError, reason: reason)
      end
    end
  end
  defmodule(Binary.Framed.Server) do
    @moduledoc(false)
    require(Logger)
    alias(Thrift.Binary.Framed.Server, as: ServerImpl)
    defdelegate(stop(name), to: ServerImpl)
    def(start_link(handler_module, port, opts \\ [])) do
      ServerImpl.start_link(__MODULE__, port, handler_module, opts)
    end
    def(handle_thrift("pingParticipant", binary_data, handler_module)) do
      case(Elixir.Thrift.Generated.GqlService.PingParticipantArgs.BinaryProtocol.deserialize(binary_data)) do
        {%Thrift.Generated.GqlService.PingParticipantArgs{request: request}, ""} ->
          try do
            rsp = handler_module.ping_participant(request)
            (
              response = %Thrift.Generated.GqlService.PingParticipantResponse{success: rsp}
              {:reply, Elixir.Thrift.Generated.GqlService.PingParticipantResponse.BinaryProtocol.serialize(response)}
            )
          rescue
            []
          catch
            kind, reason ->
              formatted_exception = Exception.format(kind, reason, System.stacktrace())
              Logger.error("Exception not defined in thrift spec was thrown: #{formatted_exception}")
              error = Thrift.TApplicationException.exception(type: :internal_error, message: "Server error: #{formatted_exception}")
              {:server_error, error}
          end
        {_, extra} ->
          raise(Thrift.TApplicationException, type: :protocol_error, message: "Could not decode #{inspect(extra)}")
      end
    end
  end
end