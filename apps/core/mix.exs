defmodule Core.MixProject do
  use Mix.Project

  def project do
    [
      app: :core,
      version: "0.1.0",
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.5",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      compilers: [:thrift | Mix.compilers],
      thrift: [
        files: Path.wildcard("../../thrift/*.thrift")
      ],
      aliases: aliases(),
      deps: deps()
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {Core.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:ecto_sql, "~> 3.2"},
      {:thrift, github: "pinterest/elixir-thrift"},
      {:ecto, "~> 3.2", override: true},
      {:plug_cowboy, "~> 2.1.0", override: true},
      {:timex, "~> 3.5"},
      {:postgrex, ">= 0.0.0"},
      {:furlex, "~> 0.4.2"},
      {:jason, "~> 1.0"},
      {:absinthe, "~> 1.4.6"},
      {:absinthe_relay, "~> 1.4.6"},
      {:absinthe_plug, "~> 1.4.0"},
      {:arc, "~> 0.11.0"},
      {:arc_ecto, "~> 0.11.1"},
      {:arc_gcs, "~> 0.1.0"},
      {:dataloader, "~> 1.0.0"},
      {:comeonin, "~> 5.1.2"},
      {:argon2_elixir, "~> 2.0"},
      {:gen_stage, "~> 0.14.2"},
      {:bourne, "~> 1.1"},
      {:flow, "~> 0.14.3"},
      {:ex_machina, "~> 2.3", only: :test},
      {:mojito, "~> 0.3.0"},
      {:ecto_enum, "~> 1.3.2"},
      {:guardian, "~> 1.2.1"},
      {:piazza_core, "~> 0.1.2"},
      {:cachex, "~> 3.2"},
      {:libring, "~> 1.0"},
      {:botanist, "~> 0.1.0", git: "https://github.com/michaeljguarino/botanist.git", branch: "ecto3"},
      {:hackney, "~> 1.15.1", git: "https://github.com/benoitc/hackney.git", override: true},

      {:mock, "~> 0.3.3", only: :test},

      {:aquaduct, in_umbrella: true}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to create, migrate and run the seeds file at once:
  #
  #     $ mix ecto.setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      "ecto.setup": ["ecto.create", "ecto.migrate"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate", "test"]
    ]
  end
end
