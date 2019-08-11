import Config

config :core, :consumers, [
  Core.PubSub.Consumers.Recurse,
  Core.PubSub.Consumers.Rtc
]

config :core, :start_broker, false
# config :core, :start_rtc_client, true
