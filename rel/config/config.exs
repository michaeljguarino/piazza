import Config
import System, only: [get_env: 1]

config :gql, GqlWeb.Endpoint,
  url: [host: get_env("HOST"), port: 80]

config :rtc, RtcWeb.Endpoint,
  url: [host: get_env("HOST"), port: 80]

config :gql, Gql.Guardian,
  issuer: "piazza",
  secret_key: get_env("JWT_SECRET")

config :rtc, Rtc.Guardian,
  issuer: "piazza",
  secret_key: get_env("JWT_SECRET")

config :aquaduct, Aquaduct.Broker,
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