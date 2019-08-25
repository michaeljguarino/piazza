defmodule Core.Repo.Migrations.FinalizeIncomingWebhooks do
  use Ecto.Migration

  def change do
    alter table(:incoming_webhooks) do
      add :conversation_id, references(:conversations, type: :uuid, on_delete: :delete_all)
      add :command_id, references(:commands, type: :uuid, on_delete: :delete_all)
    end
  end
end
