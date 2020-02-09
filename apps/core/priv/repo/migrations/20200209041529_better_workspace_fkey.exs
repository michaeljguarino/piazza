defmodule Core.Repo.Migrations.BetterWorkspaceFkey do
  use Ecto.Migration

  def up do
    drop constraint(:conversations, "conversations_workspace_id_fkey")
    alter table(:conversations) do
      modify :workspace_id, references(:workspaces, type: :uuid, on_delete: :delete_all)
    end

    drop constraint(:notifications, "notifications_workspace_id_fkey")
    alter table(:notifications) do
      modify :workspace_id, references(:workspaces, type: :uuid, on_delete: :delete_all)
    end
  end

  def down do
    drop constraint(:conversations, "conversations_workspace_id_fkey")
    alter table(:conversations) do
      modify :workspace_id, references(:workspaces, type: :uuid, on_delete: :nothing)
    end

    drop constraint(:notifications, "notifications_workspace_id_fkey")
    alter table(:notifications) do
      modify :workspace_id, references(:workspaces, type: :uuid, on_delete: :nothing)
    end
  end
end
