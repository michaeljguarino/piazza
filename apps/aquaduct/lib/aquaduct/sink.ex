defmodule Aquaduct.Sink do
  defmacro __using__(opts) do
    quote do
      use Conduit.Broker, unquote(opts)

      pipeline :error_destination do
        plug :put_destination, &(&1.source <> ".zzz")
      end

      pipeline :in_tracking do
        plug Conduit.Plug.CorrelationId
        plug Conduit.Plug.LogIncoming
      end

      pipeline :error_handling do
        plug Conduit.Plug.DeadLetter, broker: Aquaduct.Broker, publish_to: :error
        plug Conduit.Plug.Retry, attempts: 5
      end

      pipeline :deserialize do
        plug Conduit.Plug.Parse, content_type: "application/x-erlang-binary"
      end
    end
  end
end