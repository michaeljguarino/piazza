import Config

config :gql, GqlWeb.Endpoint,
  http: [port: 4000],
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

config :rtc, RtcWeb.Endpoint,
  http: [port: 4000],
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

config :core, :consumers, [
  Core.PubSub.Consumers.Recurse,
  Core.PubSub.Consumers.Rtc,
]

config :goth, json: {:system, "GCP_CREDENTIALS"}


# Do not print debug messages in production
config :logger, level: :info

config :core, public_key: {:core, "public_key.pem"}