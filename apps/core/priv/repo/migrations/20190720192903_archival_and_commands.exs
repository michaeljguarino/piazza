defmodule Core.Repo.Migrations.ArchivalAndCommands do
  use Ecto.Migration

  def change do
    alter table(:conversations) do
      add :archived, :boolean, default: false, null: false
    end

    alter table(:users) do
      add :bot, :boolean, default: false, null: false
    end

    create table(:incoming_webhooks, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :secure_id, :string
      add :name, :string
      add :disabled, :boolean, default: false, null: false
      add :bot_id, references(:users, type: :uuid)
      add :creator_id, references(:users, type: :uuid)

      timestamps()
    end

    create unique_index(:incoming_webhooks, [:secure_id])
    create unique_index(:incoming_webhooks, [:name])

    create table(:webhooks, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :url, :string
      add :secret, :string
      add :disabled, :boolean, default: false, null: false

      timestamps()
    end

    create table(:commands, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :name, :string
      add :documentation, :string
      add :bot_id, references(:users, type: :uuid)
      add :webhook_id, references(:webhooks, type: :uuid)
      add :creator_id, references(:users, type: :uuid)

      timestamps()
    end

    create unique_index(:commands, [:name])
  end
end
