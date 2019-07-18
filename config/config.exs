# This file is responsible for configuring your umbrella
# and **all applications** and their dependencies with the
# help of the Config module.
#
# Note that all applications in your umbrella share the
# same configuration and dependencies, which is why they
# all use the same configuration file. If you want different
# configurations or dependencies per app, it is best to
# move said applications out of the umbrella.
import Config

# Configure Mix tasks and generators
config :core,
  ecto_repos: [Core.Repo]

# Sample configuration:
#
#     config :logger, :console,
#       level: :info,
#       format: "$date $time [$level] $metadata$message\n",
#       metadata: [:user_id]

config :gql,
  ecto_repos: [Core.Repo]

# Configures the endpoint
config :gql, GqlWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "f1eG7CJW01KDOwE7hoQngUobzj9kvvT7Ymumr2Tzmb4XzSu7vHQsw2N1yJgFqvKN",
  render_errors: [view: GqlWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Gql.PubSub, adapter: Phoenix.PubSub.PG2]

config :gql, Gql.Guardian,
  issuer: "piazza",
  secret_key: "piazza_secret"

config :rtc, Rtc.Guardian,
  issuer: "piazza",
  secret_key: "piazza_secret"

config :gql, GqlWeb.GuardianPipeline,
  module: GqlWeb.GuardianPipeline,
  error_handler: GqlWeb.Plug.AuthErrorHandler


# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

config :rtc,
  ecto_repos: [Core.Repo]

# Configures the endpoint
config :rtc, RtcWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "5I9XpAotX5ZpsPNRlduXNwVbCllaC/sLKr9nHf/BsGdlIkfAK0Sxvd0F4slKP1j0",
  render_errors: [view: RtcWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Rtc.PubSub, adapter: Phoenix.PubSub.PG2]

config :core, Core.Repo,
  database: "piazza",
  username: "postgres",
  password: "postgres",
  hostname: "localhost"

config :botanist,
  ecto_repo: Core.Repo

config :core, :consumers, []

config :aquaduct, Aquaduct.Broker,
  adapter: ConduitAMQP,
  url: "amqp://rabbitmq:rabbitmq@localhost"

config :rtc, Rtc.Aquaduct.Broker,
  adapter: ConduitAMQP,
  url: "amqp://rabbitmq:rabbitmq@localhost"

config :cron, :run, true

# deal with some lager weirdness
config :lager, :error_logger_redirect, false
config :lager, :error_logger_whitelist, [Logger.ErrorHandler]

config :rtc, :start_broker, true

config :libcluster, :topologies, []

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"