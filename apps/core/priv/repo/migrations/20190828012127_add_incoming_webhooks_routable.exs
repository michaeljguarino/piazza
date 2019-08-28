defmodule Core.Repo.Migrations.AddIncomingWebhooksRoutable do
  use Ecto.Migration

  def change do
    alter table(:incoming_webhooks) do
      add :routable, :boolean, default: false
    end

    create table(:webhook_routes, primary_key: false) do
      add :id, :uuid, primary_key: false
      add :incoming_webhook_id, references(:incoming_webhooks, type: :uuid, on_delete: :delete_all)
      add :route_key, :string, null: false
      add :conversation_id, references(:conversations, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:webhook_routes, [:incoming_webhook_id, :route_key])
    create unique_index(:incoming_webhooks, [:command_id])
  end
end
