defmodule Piazza.MixProject do
  use Mix.Project

  @vsn File.read!("VERSION")

  def project do
    [
      apps_path: "apps",
      version: @vsn,
      start_permanent: Mix.env() == :prod,
      deps: deps()
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
      {:distillery, "~> 2.1"}
    ]
  end
end
