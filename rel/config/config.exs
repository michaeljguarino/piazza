import Config
import System, only: [get_env: 1]

config :gql, GqlWeb.Endpoint,
  url: [host: get_env("HOST"), port: 80],
  check_origin: ["//#{get_env("HOST")}", "//piazza-gql"]

config :rtc, RtcWeb.Endpoint,
  url: [host: get_env("HOST"), port: 80],
  check_origin: ["//#{get_env("HOST")}", "//piazza-rtc"]

config :core, Core.Guardian,
  issuer: "piazza",
  secret_key: get_env("JWT_SECRET")

config :core, Core.Aquaduct.Broker,
  adapter: ConduitAMQP,
  url: "amqp://rabbitmq:#{get_env("RABBITMQ_PASSWORD")}@piazza-rabbitmq"

config :rtc, Rtc.Aquaduct.Broker,
  adapter: ConduitAMQP,
  url: "amqp://rabbitmq:#{get_env("RABBITMQ_PASSWORD")}@piazza-rabbitmq"

config :core, Core.Repo,
  database: "piazza",
  username: "piazza",
  password: get_env("POSTGRES_PASSWORD"),
  hostname: "piazza-postgresql"

config :gql, :giphy_secret, get_env("GIPHY_SECRET")
config :core, :rtc_host, "piazza-rtc"
config :joken, invite_secret: get_env("INVITE_SECRET")
config :gql, github_secret: get_env("GITHUB_SECRET")
config :gql, github_incoming_webhook: get_env("GITHUB_INCOMING_WEBHOOK")

config :arc,
  storage: Arc.Storage.GCS,
  bucket: get_env("GCS_BUCKET")