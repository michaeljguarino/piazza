import Config

config :core, :consumers, [
  Core.PubSub.Consumers.Integrity,
  Core.PubSub.Consumers.Rtc
]