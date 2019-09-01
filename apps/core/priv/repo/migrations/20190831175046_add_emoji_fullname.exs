defmodule Core.Repo.Migrations.AddEmojiFullname do
  use Ecto.Migration

  def change do
    alter table(:emoji) do
      add :fullname, :string
    end

    alter table(:message_entities) do
      add :text, :string
    end
  end
end
