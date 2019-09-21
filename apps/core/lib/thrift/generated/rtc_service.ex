defmodule(Thrift.Generated.RtcService) do
  @moduledoc(false)
  defmodule(ListActiveArgs) do
    @moduledoc(false)
    _ = "Auto-generated Thrift struct Elixir.ListActiveArgs"
    _ = "-1: core.ActiveUserRequest req"
    defstruct(req: nil)
    @type(t :: %__MODULE__{})
    def(new) do
      %__MODULE__{}
    end
    defmodule(BinaryProtocol) do
      @moduledoc(false)
      def(deserialize(binary)) do
        deserialize(binary, %ListActiveArgs{})
      end
      defp(deserialize(<<0, rest::binary>>, %ListActiveArgs{} = acc)) do
        {acc, rest}
      end
      defp(deserialize(<<12, -1::16-signed, rest::binary>>, acc)) do
        case(Elixir.Thrift.Generated.ActiveUserRequest.BinaryProtocol.deserialize(rest)) do
          {value, rest} ->
            deserialize(rest, %{acc | req: value})
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
      def(serialize(%ListActiveArgs{req: req})) do
        [case(req) do
          nil ->
            <<>>
          _ ->
            [<<12, -1::16-signed>> | Thrift.Generated.ActiveUserRequest.serialize(req)]
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
  defmodule(PublishEventArgs) do
    @moduledoc(false)
    _ = "Auto-generated Thrift struct Elixir.PublishEventArgs"
    _ = "-1: core.PubSubEvent event"
    defstruct(event: nil)
    @type(t :: %__MODULE__{})
    def(new) do
      %__MODULE__{}
    end
    defmodule(BinaryProtocol) do
      @moduledoc(false)
      def(deserialize(binary)) do
        deserialize(binary, %PublishEventArgs{})
      end
      defp(deserialize(<<0, rest::binary>>, %PublishEventArgs{} = acc)) do
        {acc, rest}
      end
      defp(deserialize(<<12, -1::16-signed, rest::binary>>, acc)) do
        case(Elixir.Thrift.Generated.PubSubEvent.BinaryProtocol.deserialize(rest)) do
          {value, rest} ->
            deserialize(rest, %{acc | event: value})
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
      def(serialize(%PublishEventArgs{event: event})) do
        [case(event) do
          nil ->
            <<>>
          _ ->
            [<<12, -1::16-signed>> | Thrift.Generated.PubSubEvent.serialize(event)]
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
  defmodule(ListActiveResponse) do
    @moduledoc(false)
    _ = "Auto-generated Thrift struct Elixir.ListActiveResponse"
    _ = "0: core.ActiveUsers success"
    defstruct(success: nil)
    @type(t :: %__MODULE__{})
    def(new) do
      %__MODULE__{}
    end
    defmodule(BinaryProtocol) do
      @moduledoc(false)
      def(deserialize(binary)) do
        deserialize(binary, %ListActiveResponse{})
      end
      defp(deserialize(<<0, rest::binary>>, %ListActiveResponse{} = acc)) do
        {acc, rest}
      end
      defp(deserialize(<<12, 0::16-signed, rest::binary>>, acc)) do
        case(Elixir.Thrift.Generated.ActiveUsers.BinaryProtocol.deserialize(rest)) do
          {value, rest} ->
            deserialize(rest, %{acc | success: value})
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
      def(serialize(%ListActiveResponse{success: success})) do
        [case(success) do
          nil ->
            <<>>
          _ ->
            [<<12, 0::16-signed>> | Thrift.Generated.ActiveUsers.serialize(success)]
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
  defmodule(PublishEventResponse) do
    @moduledoc(false)
    _ = "Auto-generated Thrift struct Elixir.PublishEventResponse"
    _ = "0: bool success"
    defstruct(success: nil)
    @type(t :: %__MODULE__{})
    def(new) do
      %__MODULE__{}
    end
    defmodule(BinaryProtocol) do
      @moduledoc(false)
      def(deserialize(binary)) do
        deserialize(binary, %PublishEventResponse{})
      end
      defp(deserialize(<<0, rest::binary>>, %PublishEventResponse{} = acc)) do
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
      def(serialize(%PublishEventResponse{success: success})) do
        [case(success) do
          nil ->
            <<>>
          false ->
            <<2, 0::16-signed, 0>>
          true ->
            <<2, 0::16-signed, 1>>
          _ ->
            raise(Thrift.InvalidValueError, "Optional boolean field :success on PublishEventResponse must be true, false, or nil")
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
    def(unquote(:list_active)(client, req, rpc_opts \\ [])) do
      args = %ListActiveArgs{req: req}
      serialized_args = ListActiveArgs.BinaryProtocol.serialize(args)
      ClientImpl.call(client, "listActive", serialized_args, ListActiveResponse.BinaryProtocol, rpc_opts)
    end
    def(unquote(:list_active!)(client, req, rpc_opts \\ [])) do
      case(unquote(:list_active)(client, req, rpc_opts)) do
        {:ok, rsp} ->
          rsp
        {:error, {:exception, ex}} ->
          raise(ex)
        {:error, reason} ->
          raise(Thrift.ConnectionError, reason: reason)
      end
    end
    def(unquote(:publish_event)(client, event, rpc_opts \\ [])) do
      args = %PublishEventArgs{event: event}
      serialized_args = PublishEventArgs.BinaryProtocol.serialize(args)
      ClientImpl.call(client, "publishEvent", serialized_args, PublishEventResponse.BinaryProtocol, rpc_opts)
    end
    def(unquote(:publish_event!)(client, event, rpc_opts \\ [])) do
      case(unquote(:publish_event)(client, event, rpc_opts)) do
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
    def(handle_thrift("listActive", binary_data, handler_module)) do
      case(Elixir.Thrift.Generated.RtcService.ListActiveArgs.BinaryProtocol.deserialize(binary_data)) do
        {%Thrift.Generated.RtcService.ListActiveArgs{req: req}, ""} ->
          try do
            rsp = handler_module.list_active(req)
            (
              response = %Thrift.Generated.RtcService.ListActiveResponse{success: rsp}
              {:reply, Elixir.Thrift.Generated.RtcService.ListActiveResponse.BinaryProtocol.serialize(response)}
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
    def(handle_thrift("publishEvent", binary_data, handler_module)) do
      case(Elixir.Thrift.Generated.RtcService.PublishEventArgs.BinaryProtocol.deserialize(binary_data)) do
        {%Thrift.Generated.RtcService.PublishEventArgs{event: event}, ""} ->
          try do
            rsp = handler_module.publish_event(event)
            (
              response = %Thrift.Generated.RtcService.PublishEventResponse{success: rsp}
              {:reply, Elixir.Thrift.Generated.RtcService.PublishEventResponse.BinaryProtocol.serialize(response)}
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