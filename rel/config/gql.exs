import Config
import System, only: [get_env: 1]

config :gql, GqlWeb.Endpoint,
  secret_key_base: get_env("SECRET_KEY_BASE")

config :core, :consumers, [
  Core.PubSub.Consumers.Recurse,
  Core.PubSub.Consumers.Rtc,
  Core.PubSub.Consumers.Notifications
]

config :gql, :giphy_secret, get_env("GIPHY_SECRET")
config :gql, :start_thrift_server, true

config :core, :start_broker, true