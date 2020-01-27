defmodule Core.Exporter.Token do
  use Joken.Config, default_signer: :invite_secret

  @impl true
  def token_config do
    default_claims(iss: "piazza")
  end
end