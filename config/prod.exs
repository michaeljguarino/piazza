import Config

config :gql, GqlWeb.Endpoint,
  url: [host: "example.com", port: 80],
  http: [port: 4000],
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

config :rtc, RtcWeb.Endpoint,
  url: [host: "example.com", port: 80],
  http: [port: 4000],
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

config :core, :consumers, [
  Core.PubSub.Consumers.Integrity,
  Core.PubSub.Consumers.Rtc,
]

# Do not print debug messages in production
config :logger, level: :info