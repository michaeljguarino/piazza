import Config
import System, only: [get_env: 1]

config :gql, GqlWeb.Endpoint,
  secret_key_base: get_env("SECRET_KEY_BASE")

config :core, :consumers, [
  Core.PubSub.Consumers.Recurse,
  Core.PubSub.Consumers.Rtc
]

config :gql, :giphy_secret, get_env("GIPHY_SECRET") #"kDg0A469PK1MZZKRqk4f0fZOmjVeqAOu"
