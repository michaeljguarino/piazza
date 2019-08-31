defmodule Core.Repo.Migrations.AddEmojis do
  use Ecto.Migration

  def change do
    create table(:emoji, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :name, :string, null: false
      add :image, :string
      add :image_id, :uuid

      add :creator_id, references(:users, type: :uuid)
      timestamps()
    end

    create unique_index(:emoji, [:name])
  end
end
