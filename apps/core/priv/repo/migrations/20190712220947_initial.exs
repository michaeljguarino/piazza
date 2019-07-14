defmodule Core.Repo.Migrations.Initial do
  use Ecto.Migration

  def change do
    create table(:users, primary_key: false) do
      add :id, :uuid, primary_key: true

      add :email,         :string, null: false
      add :name,          :string, null: false
      add :handle,        :string, null: false
      add :password_hash, :string
      add :bio,           :string

      add :profile_img, :map

      timestamps()
    end

    create unique_index(:users, [:email])
    create unique_index(:users, [:handle])

    create table(:conversations, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :name, :string, null: false
      add :public, :boolean, default: true, null: false

      add :creator_id, references(:users, type: :uuid)

      timestamps()
    end

    create index(:conversations, [:name])

    create table(:messages, primary_key: false) do
      add :id,  :uuid, primary_key: true
      add :text, :string
      add :creator_id, references(:users, type: :uuid)
      add :conversation_id, references(:conversations, type: :uuid)

      timestamps()
    end

    create index(:messages, [:conversation_id])
    create index(:messages, [:conversation_id, :inserted_at])

    create table(:participants, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :user_id, references(:users, type: :uuid)
      add :conversation_id, references(:conversations, type: :uuid)

      timestamps()
    end

    create unique_index(:participants, [:user_id, :conversation_id])
  end
end
