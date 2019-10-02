import Config
import System, only: [get_env: 1]

config :gql, GqlWeb.Endpoint,
  secret_key_base: get_env("SECRET_KEY_BASE")

config :libcluster,
  topologies: [
    gql: [
      strategy: Cluster.Strategy.Kubernetes,
      config: [
        mode: :ip,
        kubernetes_node_basename: "gql",
        kubernetes_selector: "app=gql",
        kubernetes_namespace: get_env("NAMESPACE"),
        polling_interval: 10_000
      ]
    ]
  ]

config :core, :consumers, [
  Core.PubSub.Consumers.Recurse,
  Core.PubSub.Consumers.Rtc,
  Core.PubSub.Consumers.Notifications,
  Core.PubSub.Consumers.Fanout,
  Core.PubSub.Consumers.Cache,
  Core.PubSub.Participants
]

config :gql, :giphy_secret, get_env("GIPHY_SECRET")
config :gql, :start_thrift_server, true
# config :core, :start_rtc_client, true

config :core, :start_broker, true