defmodule Core.Repo.Migrations.AddNotifications do
  use Ecto.Migration

  def change do
    create table(:notifications, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :type, :integer
      add :user_id, references(:users, type: :uuid)
      add :actor_id, references(:users, type: :uuid)
      add :message_id, references(:messages, type: :uuid)

      add :seen_at, :utc_datetime_usec

      timestamps()
    end

    create index(:notifications, [:user_id])

    create table(:message_entities, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :type, :integer
      add :message_id, references(:messages, type: :uuid)
      add :user_id, references(:users, type: :uuid)
      add :start_index, :integer
      add :length, :integer

      timestamps()
    end

    create index(:message_entities, [:message_id])
  end
end
