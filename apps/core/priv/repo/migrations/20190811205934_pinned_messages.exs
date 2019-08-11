defmodule Core.Repo.Migrations.PinnedMessages do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add :pinned_at, :utc_datetime_usec
    end

    create index(:messages, [:conversation_id, :pinned_at])
  end
end
