defmodule Core.Repo.Migrations.AddWorkspaces do
  use Ecto.Migration

  def change do
    create table(:workspaces, primary_key: false) do
      add :id,          :uuid, primary_key: true
      add :name,        :string, null: false
      add :description, :string

      timestamps()
    end

    alter table(:conversations) do
      add :workspace_id, references(:workspaces, type: :uuid)
    end

    alter table(:notifications) do
      add :workspace_id, references(:workspaces, type: :uuid)
    end

    create unique_index(:workspaces, [:name])
    create index(:conversations, [:workspace_id])
    create index(:notifications, [:user_id, :workspace_id])
  end
end
