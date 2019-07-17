import Config
import System, only: [get_env: 1]

config :rtc, RtcWeb.Endpoint,
  secret_key_base: get_env("SECRET_KEY_BASE")