defmodule Core.Repo.Migrations.AddWebhookSecrets do
  use Ecto.Migration
  require Logger
  alias Core.{Repo, Models.Webhook}

  def up do
    Repo.all(Webhook)
    |> Enum.each(fn webhook ->
      {:ok, _} = Webhook.changeset(webhook, %{})
                 |> Repo.update()
    end)
  end

  def down do
    Logger.info "hopefully everything works backwards"
  end
end
