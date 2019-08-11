defmodule Core.Repo.Migrations.AddMessageReactions do
  use Ecto.Migration

  def change do
    create table(:message_reactions, primary_key: false) do
      add :id,         :uuid, primary_key: true
      add :name,       :string
      add :message_id, references(:messages, type: :uuid, on_delete: :delete_all)
      add :user_id,    references(:users, type: :uuid)

      timestamps()
    end

    create unique_index(:message_reactions, [:name, :message_id, :user_id])
    create index(:message_reactions, [:message_id])
  end
end
