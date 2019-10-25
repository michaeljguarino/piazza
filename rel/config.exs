# Import all plugins from `rel/plugins`
# They can then be used by adding `plugin MyPlugin` to
# either an environment, or release definition, where
# `MyPlugin` is the name of the plugin module.
~w(rel plugins *.exs)
|> Path.join()
|> Path.wildcard()
|> Enum.map(&Code.eval_file(&1))

version = File.read!("VERSION")

use Distillery.Releases.Config,
    # This sets the default release built by `mix distillery.release`
    default_release: :default,
    # This sets the default environment used by `mix distillery.release`
    default_environment: Mix.env()

# For a full list of config options for both releases
# and environments, visit https://hexdocs.pm/distillery/config/distillery.html


# You may define one or more environments in this file,
# an environment's settings will override those of a release
# when building in that environment, this combination of release
# and environment configuration is called a profile

environment :dev do
  set dev_mode: true
  set include_erts: false
  set cookie: :"xQWL/mWNjfw&&fT2a%Oq_>YV?5u5asab!L@$TIf|7gLA{=^c8K>i(($XNNAr*w$B"
end

environment :prod do
  set include_erts: true
  set include_src: false
  set cookie: :"xQWL/mWNjfw&&fT2a%Oq_>YV?5u5asab!L@$TIf|7gLA{=^c8K>i(($XNNAr*w$B" # this will not be used, but will suppress a distillery warning
  set vm_args: "rel/vm.args"
  set config_providers: [
    {Distillery.Releases.Config.Providers.Elixir, ["${RELEASE_ROOT_DIR}/etc/config.exs"]},
    {Distillery.Releases.Config.Providers.Elixir, ["${RELEASE_ROOT_DIR}/etc/app.exs"]}
  ]
  set overlays: [
    {:copy, "rel/config/config.exs", "etc/config.exs"},
    {:copy, "rel/config/<%= release_name %>.exs", "etc/app.exs"}
  ]
end

release :gql do
  set version: version
  set applications: [
    :runtime_tools,
    aquaduct: :permanent,
    core: :permanent,
    gql: :permanent,
    graphql: :permanent
  ]
  set commands: [
    migrate: "rel/commands/migrate.sh",
    drop: "rel/commands/drop.sh"
  ]
end

release :rtc do
  set version: version
  set applications: [
    :runtime_tools,
    aquaduct: :permanent,
    core: :permanent,
    rtc: :permanent,
    runtime_tools: :temporary,
    graphql: :permanent
  ]
end

release :cron do
  set version: version
  set applications: [
    :runtime_tools,
    aquaduct: :permanent,
    core: :permanent,
    cron: :permanent
  ]
end

