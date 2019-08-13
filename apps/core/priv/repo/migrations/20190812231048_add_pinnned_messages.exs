defmodule Core.Repo.Migrations.AddPinnnedMessages do
  use Ecto.Migration

  def change do
    create table(:pinned_messages, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :message_id, references(:messages, type: :uuid, on_delete: :delete_all)
      add :conversation_id, references(:conversations, type: :uuid, on_delete: :delete_all)
      add :user_id, references(:users, type: :uuid)

      timestamps()
    end

    create unique_index(:pinned_messages, [:message_id, :conversation_id])
  end
end
