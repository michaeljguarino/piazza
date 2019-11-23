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

config :goth,
  json: System.get_env("GOOGLE_APPLICATION_CREDENTIALS") |> File.read!()

config :core, Core.TestBroker,
  adapter: ConduitAMQP,
  url: "amqp://rabbitmq:rabbitmq@localhost"

config :rtc, :start_broker, false
config :core, :start_rtc_client, false

config :cron, :run, false
config :rtc, :start_client, false
config :rtc, :start_thrift_server, false

config :logger, level: :warn

config :core,
  public_key: "-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAtxWAdXqwdVJgX7AJTSbZUptebOJjVmpTdUP1eRTr8owDCcbYWqw5\nyYhT/tco58IBrbglYNo4mxoyN2wWZMOr1t8E7ECOA1d6qZaLClLLI9zyDse+0mc1\nOeOeFQqaamBZuLITKHbXEcRYKBDwQWK2l0gUmlbKVq2EpvjhAOfgPornbd/tk9OA\nA6AZ9JVJjE72gG4D2LK47uP7fOjAZvDteUCjbjSsiSo6zysAI6YUT/0YS6fbQ/ZB\ntmC+s4qCNFao4RD3RZi7GNl/9tzA96teueXG0HOags4SK/14kUulbi4bSpwp/7JF\nTbmGMdZsG9UzL9loSAi1BAVs3U/ygwW4VwIDAQAB\n-----END RSA PUBLIC KEY-----\n\n"
config :core,
  license: "FLb53uUeWkPqliKTHKEzm-EHqvQ3WSmv35sHot_2ziQMhTRgfVrCJthl8i2v4aMgoFXNAoDDLnLMm5FUMO4w1pYSTQiBeJOVC2gPFDkIxt3jHyCWU39kAqJ9QWuYZnE6_B4s5nO1IhgV-8EwEfyEnncCxwqjvuRqbNKFoV786NW8ysJgSSCiEQKFV4iLwG2O5KNEeObqVJRvHjlr7m5Mi-2X3silfoLiaJfoh6wa7coSrVi21-6TrFjsZbgzK6Senvy96UI-ol60m1CSPGQg3q9takS0-VT9QR-a7vLL0BZb3QLonuSqMe43os2nSX1qJZ4t6tWNpvQIOPQao0NViw=="