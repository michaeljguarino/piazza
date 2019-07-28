defmodule Core.Repo.Migrations.AddConversationTopic do
  use Ecto.Migration

  def change do
    alter table(:conversations) do
      add :topic, :string
    end
  end
end
