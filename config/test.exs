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

config :logger, level: :warn

config :core,
  public_key: "-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAqTYI/rcwKF3927C76rYgI+y5Ff0Kbq6vULuCDorCS1OJsXyeRIGv\ndumhTLEqRsMr+IckK5o6J/z9MmAYYnGyAcxGKqV1J0xTET+mAg1MOg1nAneowByg\nF9jOL3i3rFCcg234hT4uY2BIt0EjLrRLUC5OiO29uB6q+al/d3BmYBnwRHDXSuen\n4EtiqNtYymOLwp4EyRz1SpcOo3yGT304llRx/GVR5Sm3ifTThLqXvszc4+/7oUoy\n2Ka90ZrEHwT2e+ye7Hjk/Kq/c1YFGrN5WRRsFgkrDgt3Y885Q0NTQ4hvydTDxBld\ndyg9b7/QQ7kQp6He+LGVh13aQHr1F8ewdQIDAQAB\n-----END RSA PUBLIC KEY-----\n\n",
  license: "lCPzjClaa8bPmlOU1ArocsyXlMkfFbfdvpOruQgagjQQ-p4XhJ5BjSNHVYpBt1hPwBOnB3kPBEthX70keFS-XqQ8963yRfcKt6UIBlMNqOGFk92TUslnjmtMrb_Px2_fl28HMZYtgfjVNT6dtGLn58hJSzhMXPQ2LxtZ0_g4xSJWTbTMgKTJWKjOUKQIz9MJVlq1cmi5ETfspkPv_LukLxGhzUpAn4N6Ypf8RlU7JvsYcji-6stEQKKuV7cin84ugwMtMEPYIgwu33BSRPUdZuppjeYyakQ4MtiZySprsacR0yIJmEO9qfm4kcIniuHMEab8lzrDr3aS1a1LqQ36hw==::o3pbJm4XhV7v4M544jM691ObEDiXr9_HVrJ10IksPHP0Tf-P2eOIPTcUlj107fshfuSKDD3kmGECjUYHnHTHEVWd_jBWGeF9IuGfP_BduBt6HTAdw8tlo8PcLXvxDAXW0x8v3vYJugmEcfQe1TubGUjHVudvni3tRqBHv8XgRQefkuUkCtYCYEB2eTfhrJyPzJyaU_NiMgMPSpDUxcV8ILzcC6XhZFOidWcmDZ5sIz7a53UtBD-vUH-DVrWbQ9YxPmR7clKoDOncOrV-IMKRe5OADUj2TZVrcsS4oTzLiTybOmRP0MVUN81ePMZwuLn-r-fWlajvXrYOqh6h2ETyZQ==::uK-Pgz980ycV14-P_nFbjbt2rPWANTaagYA8sM3E4BnAhE29qP1ASlUrYctBLWQMO5pewtgD0kBOz4DpDWItpPD1Bo7Yw6AZfzGLuP-okLGfNS1j1I7GinGUi9g13HDBazLogiJ9XGioa1815KHVyCKKVRRzwQXoj1sm5ICvN-Mo1YcdvsYFujv8TN7pF9xCQkl4Gmv4zqd3GKe_jL2Ou_rw9RX0QfJ-32DQIelUE43otZhUH2qAOzaHBMxBwX8I2BWEVPqP8KUJ0Bk36aNBCwmEhOIhgEsSNrPcuwA72wKtCIKtaNn_teYZu5PTv2WTzJVWrBoTraJcV6vSTTYqMqI8EaBwcLCRrBNQ9MaxRgIQpRW8JGJHQPwBfnCE7ItTa6ex90MxKX5TAsx1u2G2M0OVCoFgF6pgq3V-lix2q3E=",
  expired_pk: "-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAwMrVXIRGLJ+Yzwbr/t6MkQQIDojmNbRjEEIePmFkRgKTShSQ80R/\nF9Y5rbwa1TRnHp7vsaMfs0ekEqMQnUtOwby9fZRf4qKSBou376xn1BXSkgEgAmwQ\nk3GNxwH4yHpQbwHv1ntfT3XXFIwiKq9Nd6qz9GgEbFzbyzp32ee6+3cJPyI8o7Tw\nwzAmQJzTHhumLYC/0dqqUYpJ/4IDlpgY8aXVsKtGD6j/3qy/zTRNkecia4KZPrWT\naex5aU1uYDlxN1NFaGyMGGYBKmC5kCF0SABevgHHTNfVJZZK/dwgTYg2eukbabFl\nIyeh8s3NUK3nvi96WA7k0ZNiwnjvOETeHwIDAQAB\n-----END RSA PUBLIC KEY-----\n\n",
  expired_license: "kBAgyiOBpAg0aylYrS56dwYXeDAgoW-l96gvZiSw_J20Tq_7tnadvHKrfWak2e-QDHx_z0buQ7GfOrCwhvbTH3eGw0vVZUBYQjYv3E7dof-PT9IsIya2wdsXTyvz0Nql-N9aXdgfYAHf_qgHQ-JRGD8gjBiX8xORp3tvj6cFbevD_WBdkCu0mElpxl8o2qRtPN6EtxGqXkZsl9VYHc_p-ki3GSoIerpZe-U--dZiqVDU-3xeqear5bLz3w8HKTPNnZVN21cSOjriSpQvXZJDAv2MqzqwF8ZyhlzydT9L7oLPvFUyzewA1SSwvcCo5_vlGbM5JTOXxvlkALTIexhIWg==::qcoKhBpUhw0RNW1pRPw0BP-pYQ-4c_vfDO2gMKFxP4_VnkbYaUS2omVKa7h1ft1XWiKTuZ9y179oHbORWFihrexNylXko19j4DBkjC5PWjplrBtS5YaNU3LmxWw4EkTlzwpe2t1y1wGMMhqrXHJTyw8UJeKYoScrhiknGTEREBuzXQ85qe6fBYIVER_4yZ9uD8Tfiiir6HPmarhzylRsyNyQ5rQb1bsHsNXgCOkc3F57c6WGvRjQlqc7E9xttlJTYBsY0PpYfQldAbjkJNWbAzPj12tARBakZ05goMGhk7flMmk0Bo9dIwUGP_FtG47QrbYp93jrGqmRUKQTzppreA==::fhsSpSHU39goyyY7IGTN3OE0EUuc0kzQM1oZv35ZkCDflXOOy50l4iocV7LfrJUR0nh2Tfjvqttz-oV3ACiCQUe1pxKPsO7Z8TSpoZfguyuOpU4IVCJU25YaRIla4jdNGbudGdEs2emT-LRPVzy27GRJiPrpNa1MFhDEyE7Xd_EG7cI2PJmPlJhsvYbsyUfA3SJIK0kC0tMVp7BFbDHNgyBDwRHjTzUXGi5G-0sOCj_O_OKu6GLbEv77Xq1bZxxw_FZxc_MqI_LFKGiFpNWe6vhj_5yFDbUI3DfwZq3qU_fthxPPEV9Dt3_cENhvyFFzdz3B8qpZOQs3Qwv38XJ_Gu_EY06s12WAVKQMpk061_A="

config :grpc, start_server: false
config :piazza_core, license_interval: 1_000_000_000