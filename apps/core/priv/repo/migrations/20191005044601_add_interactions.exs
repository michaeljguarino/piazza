defmodule Core.Repo.Migrations.AddInteractions do
  use Ecto.Migration

  def change do
    create table(:interactions, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :message_id, references(:messages, type: :uuid, on_delete: :delete_all)
      add :command_id, references(:commands, type: :uuid, on_delete: :delete_all)

      timestamps()
    end
  end
end
