defmodule Core.Repo.Migrations.AddChatSchema do
  use Ecto.Migration

  def change do
    alter table(:conversations) do
      add :chat, :boolean, default: false, nil: false
      add :chat_dedupe_key, :string
    end

    create unique_index(:conversations, [:chat_dedupe_key])
  end
end
