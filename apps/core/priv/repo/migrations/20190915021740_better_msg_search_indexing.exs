defmodule Core.Repo.Migrations.BetterMsgSearchIndexing do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add :flattened_text, :string, size: 2000
    end

    execute("""
    CREATE INDEX messages_flattened_trgm_index ON messages USING GIN (to_tsvector('english', flattened_text))
    """)
  end
end
