defmodule Core.Repo.Migrations.AddMsgSearch do
  use Ecto.Migration

  def up() do
    execute("""
    CREATE INDEX messages_trgm_index ON messages USING GIN (to_tsvector('english', text))
    """)
  end

  def down() do
    execute("DROP INDEX messages_trgm_index")
  end
end
