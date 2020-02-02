import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :email, Email.Endpoint,
  http: [port: 4002],
  server: false

config :email, Email.Mailer,
  adapter: Bamboo.TestAdapter

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
  public_key: "-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEA1pDbloUpsa4pz00Vldlo0lQF+mePFdM7y+eCc0NmT+3Oro2BQDsf\n9zvj1wl5SPnIcdoCEYh5NUgerc0ad9UtxKtRtiFEmb+5pC/EgZcJ1dHoKJdNKZD1\nft1Ko7mb/j3zYBR740/nepl679pXtcnoofsFAGw1BIcf1jyV+r1Vm7TnPP/rJGHf\n9+mC6XmRyFuG2KkE2VvKt4QiH/5t6wcw7nGDARzc7gAz7xvi2b3deX21ML4ghwhl\nRyJ2cNUNYLUJ8S/A1G/ssu0az+IjLIcXOwPbzaxuOW4y93nXE/1BGvdxYiRwYR/j\nVMnyB1RkSzwVi60f5pwk7dG7iEaoEf/+0QIDAQAB\n-----END RSA PUBLIC KEY-----\n\n",
  license: "kdyP4ho730tm7F0GN10pvuPTfkDBrKFbJLO-FeljttTCRdyrFze2_t4-XLJz2x5kWX-YgWuYG0ePuteGL9sk_4REhE5Y0iYXdTvb0_lxVCP_kjKIrJ4ehUO3LCOQZySD3jJ76jtn4J4o9SVMa6Bimx1cfSitR1x_Av7-fqpd5wY2stl-eGBqhVacL3TsdycDxFH2AEzo1VtD0sDsRvH0wF4QvedBuAaFWgMfUXd7hNRk1quAZYz5iu46TeZme3K7HLQx-9jGuRVaDZpnd2V6ZgRpTymMfAQXlGS9wNfWMBC0TjLrOiYhcO5Zviy3--6LGm-wvoy7Q04s2NlrDc_Bzg==::OZ0mGoa3IdeWWqu3_35y2f6X3DISQBZrv7ReWUgw3Y8SSOK0gqp4zZ77MWwqbyaBZBDL4n_Rz0-7oNJ3tKS-ItvpYgc-YZbepZAl38ZLOQ-KKaM8_AEP9EJ5PZKgd6D6hi2B9tW_nTsaDmVMufIrEBwmfS6IAFLUN3-XOyChthO4mdbbliCkTri3A6b3XgtCLuPX2JLFotMYbObrOr3780cmlEGhWpi_A545sxEWhQ2RwiOLyuyy8FfAjhZNhjSS0z2SYp_otwFO0zd9Ojrp7dH5pE1qg20qOZJNKXN5TIdDX2Iod2KQui8GGbjIu2axSro9huDDTW2Pl22PYA1PDM3ZLdiwrHmQ8BjI6POozkblslBaJZ5ybYHpYlcbATqK"

config :core,
  expired_pk: "-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAzjY6uTX0Dutq98/fSGX77vHyuhkbROxtEQlyHvNGuQgHh1jko0+I\nhlpyQYJeMRwdxT4snBU0/yz7Eo9qAf15EPSDUPoqfIy71oYVEjliNVEitj/oWXhE\nJQrcU7KFX48QmG0aTIm2Zt8z1X0D32iaIsnjmN3/qtZdxgZESUMjSlKyXHFHes1K\n0c5CnkgJdPBU7zIWVk/X+HN+nqtsXK0ZXCCH2d9o+XF5v7oc+Y0Bc6P6JAlbs/Vv\nTVgo0QLTNxCC2TWaq4nPymQhgUun5cun0LHyqVtfJzviVfvhu3KgYrf0ROffUgRu\npskJAqR89qQSfNwx1OfZUjT8JciCyIFo7QIDAQAB\n-----END RSA PUBLIC KEY-----\n\n",
  expired_license: "ihlRkJg8NVMID8SPBUDeT7e61ZXtOui3h3evAljuDH58BPKeg4fbBkJFI9mj-eQV-7p97w_eBNleh3dkXle7HdKN03RP71z1WvDSbacWxcPIDxOOVoXwMBWAMUGOXCNgpeu1xQkU45QHUnNUFrJ4IJLJVd2-0or9zthw4K6-VhF3g0cqF4z0PRcewGxxZERPTjtDuTxHfn1oh4siJRiLBkvMIw7VduZQD7bcKG5nKT3UI8ThmB3CdTLqHWZ4jZoPZJ_px0gVL4B3jTOc2UWvM8xe5HEisxs4zi5jgwwKrxNz4m1rPF6XNR9npmvNxkLS-9evhz3PSBWCVRzKFFFT8g==::e4LnaIofTyzGmH-_9pBihDmjraXNl-JZq78IxpLFPQjgAaFnZDuSYoCLLLVXN09GwKK0WQxYpl3H_QyRfoRaHOlWxjOoFjy30DOIezDhQHa_jl76KRVzXZqRJUj1P3Zx5LuOhigE_xTqQmHlDZA5gxYp4TWxZ-gWhaBISwvru30ysToQE0JkiEQJ1wsIPF2SliVbpuFeU-GHhLMWDIC2F6AmWnWxu3mVaRsHlwBrxxPRG52fN_BI6F0eS3PXCfHBjRqW8Qg5QDo4Nsu4AS13xVmnXjkSIuvvz7CqgwSqWItSBD_qER0MEWqUyDbnJx_LK5q2s_QdWPNL9PATdqJgVVmvdWt4wBOaR2dhUEzmi5Bp8O9_10TTUAXFK0qJ05RK"

config :grpc, start_server: false