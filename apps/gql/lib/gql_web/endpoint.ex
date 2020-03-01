defmodule GqlWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :gql

  @upload_maximum 50_000_000

  socket "/socket", GqlWeb.UserSocket,
    websocket: true,
    longpoll: false

  # Code reloading can be explicitly enabled under the
  # :code_reloader configuration of your endpoint.
  if code_reloading? do
    socket "/phoenix/live_reload/socket", Phoenix.LiveReloader.Socket
    plug Phoenix.LiveReloader
    plug Phoenix.CodeReloader
  end

  plug CORSPlug

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, {:multipart, length: @upload_maximum}, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library(),
    body_reader: {Gql.CacheBodyReader, :read_body, []}

  plug Plug.MethodOverride
  plug Plug.Head

  plug Gql.Plug.MetricsExporter

  plug GqlWeb.Router
end
