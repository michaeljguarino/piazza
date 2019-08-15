defmodule Piazza.MixProject do
  use Mix.Project

  @vsn File.read!("VERSION")

  def project do
    [
      apps_path: "apps",
      version: @vsn,
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      aliases: aliases()
    ]
  end

  # Dependencies listed here are available only for this
  # project and cannot be accessed from applications inside
  # the apps folder.
  #
  # Run "mix help deps" for examples and options.
  defp deps do
    [
      {:ecto, "~> 3.1.7", override: true},
      {:distillery, "~> 2.1"},
      {:plug_cowboy, "~> 2.0", override: true},
      {:absinthe, "~> 1.5.0-beta.1", git: "https://github.com/absinthe-graphql/absinthe.git", override: true},
    ]
  end

  defp aliases do
    [
      "ecto.setup": ["ecto.create", "ecto.migrate"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate", "test"]
    ]
  end
end
