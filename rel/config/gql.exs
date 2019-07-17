import Config
import System, only: [get_env: 1]

config :gql, GqlWeb.Endpoint,
  secret_key_base: get_env("SECRET_KEY_BASE")

config :core, :consumers, [
  Core.PubSub.Consumers.Integrity,
  Core.PubSub.Consumers.Rtc
]