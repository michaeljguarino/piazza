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

config :email,
  ecto_repos: [Core.Repo],
  generators: [context_app: false],
  domain: "piazzaapp.com",
  host: "https://chat.piazzaapp.com"

# Configures the endpoint
config :email, Email.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "hRenGXlFBmj1NSEkmQMHdxxrQvFxYKXNQN6nYz2M7NU/P2LcMtRhCRdz9v4Fu6Ry",
  render_errors: [view: Email.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Email.PubSub, adapter: Phoenix.PubSub.PG2]

config :email, Email.Mailer,
  adapter: Email.Adapter.Forge

# Configure Mix tasks and generators
config :core,
  ecto_repos: [Core.Repo]

config :piazza_core,
  repos: [Core.Repo]

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


config :core, Core.Guardian,
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
  migration_timestamps: [type: :utc_datetime_usec],
  database: "piazza",
  username: "postgres",
  password: "postgres",
  hostname: "localhost"

config :botanist,
  ecto_repo: Core.Repo

config :core, :consumers, []

config :core, Core.Aquaduct.Broker,
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

config :core, :start_broker, true
config :core, :forge_url, "https://forge.piazza.app"

config :arc,
  storage: Arc.Storage.GCS,
  bucket: "piazzaapp-uploads-test"

config :goth,
  json: {:system, "GOOGLE_APPLICATION_CREDENTIALS"}

config :core, :rtc_host, "localhost"
config :rtc,  :gql_host, "localhost"
config :rtc,  :start_client, true
config :core, :start_rtc_client, false
config :core, :default_workspace, "general"

config :joken, invite_secret: "super_secret"
config :gql,   github_secret: "super super secret"
config :gql,   github_incoming_webhook: "https://dummy.webhook"

config :grpc, start_server: true

config :core, Core.Cache.Local,
  gc_interval: 86_400,
  allocated_memory: 1_000_000,
  n_shards: 3,
  gc_cleanup_interval: 100

config :core, Core.Cache,
  local: Core.Cache.Local,
  node_selector: Nebulex.Adapters.Dist

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"