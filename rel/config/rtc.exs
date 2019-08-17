import Config
import System, only: [get_env: 1]

config :rtc, RtcWeb.Endpoint,
  secret_key_base: get_env("SECRET_KEY_BASE")

config :libcluster,
  topologies: [
    rtc: [
      strategy: Cluster.Strategy.Kubernetes,
      config: [
        mode: :ip,
        kubernetes_node_basename: "rtc",
        kubernetes_selector: "app=rtc",
        kubernetes_namespace: get_env("NAMESPACE"),
        polling_interval: 10_000
      ]
    ]
  ]

config :rtc, :gql_host, "piazza-gql"

config :core, :start_broker, false