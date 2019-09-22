defmodule Core.Repo.Migrations.AddMessageReply do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add :parent_id, references(:messages, type: :uuid, on_delete: :delete_all)
      add :reply_count, :integer, default: 0, null: false
    end
  end
end
