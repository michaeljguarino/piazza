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
  public_key: "-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAqyZhY0pFW9TVXMMQE3MEnAjA/jzKMNJN3wyHooGN+xvFJAfYfO6x\nLBtaW4Imm5BBRmXiDPyq0ZgefxMuo0vQ2yjoCrcm4nGI2d3tuhMHYnCSFIS9XH9m\ndLQI4b7K0/xqkEOWfT6Ly8c9KV31o/vPeuJfmJddOCer4XJi6d9JddlpCAHGB2P+\nK3Rrm3rAOGwmAKoGptA9Vj+rOWjnsdjD9zVrqMWqO5fICjKpCOpThZrPB+Nit0BO\n+wE8sPAw/z4lqfyvIN6uh4HbYxStAZlFKMcBWIQfU/+LSj1c40hTaQTIupb7BbpP\nMuidDO6zD2zJy1gksM1CMPRr8wE3WA1jwQIDAQAB\n-----END RSA PUBLIC KEY-----\n\n",
  license: "DU9iGbcxdye5Yao6mYTYs9EpBqK11gR9zn-iFqK07zg4e0grlBlZ8Hw4ufaKlyMuZ3rYIoZ2kwUPVNkR920G9sfibhppycYiMo06AB5IokNHWH4ftByt7QGZk4j2_oQ0LpelWyxS8Ne38qJP1_7wXfO9m0RRNU6Rk2tXexckMBm7ZRbnQ3A6u6JREq8qgpg5h0ujk7zEKgiqLfOWGEn_Gxi7Wr4K4YBCqmRlPprDXj8GPfCtz_-PBluczTr9ZD8NLp8b6Dc7ZSU44s3b7SJvi0BGtDbHSop0qTwm-MZIR0KzZ1Mn7GQEh3Qm4sUqjgl3CHLvZrJmZ9QeM0p80ApYfQ=="

config :core,
  expired_pk: "-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAyAPdM4xStZLPaTRL9ErU7VzqE4t7H/E3YorJYwfdN82wm7ZXj63N\n6NNfVjre+jlmueWmn8oIH6KOjRZ+tQFIVgE4rBkua2DvU6Bh5cKNNKWk++VBHWzb\nCibSOcbftq2yFIi/WR6GzOpsqAffISNtBn+WYzTc97S82I3YXxOqFI6O/BixQi6U\n6z5uGJIR68mo8RrsxCkVzwDGAFOICq2deuhiVDm2BKmK63vJBZLSQFB3RXCvq8uL\nl9aAULkY328REC97zKCCPA3Gj15IMe4cw/j9odRGDJaqwe2KLD8Yukex0qG4raVW\nWxGYGdWuKt/JXKdu5qZ2Rtcf4DuR/p3zbwIDAQAB\n-----END RSA PUBLIC KEY-----\n\n",
  expired_license: "l2hgxvMnOTcaNUEUShlsgXmC24Ox8XwK7WRQ_2pxzKmlQ9ybfnHG1d9df0HDw96iVW4BI8N5Wzwwvt7ygLfsNC2XRx_tDIQPqJVZAAakwGghT4UNuC-s6PFNaNqp8zGB95C9Zu6Ky5Uu7jurGQpaPWcYaGRv1bUkBFl_36EQyUfsbFSukSOeJSmvYJ3u_N4Q1t4EkxW8Kn6At-CRLYDfgHibLFjWWxDTg049PICNx2M0aWlfhs48P68RZaL8o9FYBVC_U16cjSM1OQMcSKkurHs74GWIohV5j4vy3DuJXjB6RLAWDiE3-8iZCguFojx8iASiizv4jWx98OKgXoQbeQ=="

config :grpc, start_server: false