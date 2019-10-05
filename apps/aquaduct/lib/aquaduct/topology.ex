defmodule Aquaduct.Topology do
  defmacro __using__(opts) do
    quote do
      use Conduit.Broker, unquote(opts)

      configure do
        exchange "piazza.topic", type: :topic, durable: true
        queue "piazza.rtc", from: ["piazza.rtc"], exchange: "piazza.topic", durable: true
        queue "zzz.piazza.rtc", from: ["zzz.piazza.rtc"], exchange: "piazza.topic", durable: true

        queue "piazza.webhook", from: ["piazza.webhook"], exchange: "piazza.topic", durable: true
        queue "zzz.piazza.webhook", from: ["zzz.piazza.webhook"], exchange: "piazza.topic", durable: true

        queue "piazza.interaction", from: ["piazza.interaction"], exchange: "piazza.topic", durable: true
        queue "zzz.piazza.interaction", from: ["zzz.piazza.interaction"], exchange: "piazza.topic", durable: true
      end

      pipeline :out_tracking do
        plug Conduit.Plug.CorrelationId
        plug Conduit.Plug.CreatedBy, app: "aquaduct"
        plug Conduit.Plug.CreatedAt
        plug Conduit.Plug.LogOutgoing
      end

      pipeline :serialize do
        plug Conduit.Plug.Format, content_type: "application/x-erlang-binary"
      end

      pipeline :error_destination do
        plug :put_destination, & "zzz.#{&1.source}"
      end

      outgoing do
        pipe_through [:out_tracking, :serialize]

        publish :rtc, exchange: "piazza.topic", to: "piazza.rtc"
        publish :webhook, exchange: "piazza.topic", to: "piazza.webhook"
        publish :interaction, exchange: "piazza.topic", to: "piazza.interaction"
      end

      outgoing do
        pipe_through [:error_destination, :out_tracking, :serialize]

        publish :error, exchange: "piazza.topic", to: "piazza.error"
      end

      pipeline :in_tracking do
        plug Conduit.Plug.CorrelationId
        plug Conduit.Plug.LogIncoming
      end

      pipeline :error_handling do
        plug Aquaduct.Plug.DeadLetter, broker: __MODULE__, publish_to: :error
        plug Aquaduct.Plug.Retry, attempts: 3
      end

      pipeline :deserialize do
        plug Conduit.Plug.Parse, content_type: "application/x-erlang-binary"
      end
    end
  end
end