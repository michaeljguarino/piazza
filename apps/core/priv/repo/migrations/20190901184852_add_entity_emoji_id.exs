defmodule Core.Repo.Migrations.AddEntityEmojiId do
  use Ecto.Migration

  def change do
    alter table(:message_entities) do
      add :emoji_id, references(:emoji, type: :uuid, on_delete: :delete_all)
    end
  end
end
