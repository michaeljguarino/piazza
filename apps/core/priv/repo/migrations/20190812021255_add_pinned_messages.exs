defmodule Core.Repo.Migrations.AddPinnedMessages do
  use Ecto.Migration

  def change do
    alter table(:conversations) do
      add :pinned_messages, :integer, default: 0, null: false
    end
  end
end
