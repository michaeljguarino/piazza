import Config

# Configure your database
config :core, Core.Repo,
  username: "postgres",
  password: "postgres",
  database: "piazza_test",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

config :core, Core.Repo,
    pool: Ecto.Adapters.SQL.Sandbox

config :core, :consumers, [
  Core.EchoConsumer
]

config :core, Core.TestBroker,
  adapter: ConduitAMQP,
  url: "amqp://rabbitmq:rabbitmq@localhost"

config :rtc, :start_broker, false

config :logger, level: :warn