import Config
import System, only: [get_env: 1]

config :gql, Gql.Guardian,
  issuer: "piazza",
  secret_key: get_env("JWT_SECRET")

config :rtc, Rtc.Guardian,
  issuer: "piazza",
  secret_key: get_env("JWT_SECRET")

config :aquaduct, Aquaduct.Broker,
  adapter: ConduitAMQP,
  host: "piazza-rabbitmq",
  username: "rabbitmq",
  password: get_env("RABBITMQ_PASSWORD")

config :rtc, Rtc.Aquaduct.Broker,
  adapter: ConduitAMQP,
  host: "piazza-rabbitmq",
  username: "rabbitmq",
  password: get_env("RABBITMQ_PASSWORD")

config :core, Core.Repo,
  database: "piazza",
  username: "piazza",
  password: get_env("POSTGRES_PASSWORD"),
  hostname: "piazza-postgresql",
  ssl: true