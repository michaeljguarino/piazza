defmodule Core.Repo.Migrations.AddThemes do
  use Ecto.Migration

  def change do
    create table(:themes, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :name, :string, null: false

      add :brand, :string
      add :sidebar, :string
      add :sidebar_hover, :string
      add :focus, :string
      add :action, :string
      add :action_hover, :string
      add :focus_text, :string
      add :active_text, :string
      add :tag_light, :string
      add :tag_medium, :string
      add :presence, :string
      add :notif, :string
      add :link, :string

      add :creator_id, references(:users, type: :uuid, on_delete: :delete_all)
      timestamps()
    end

    create unique_index(:themes, [:name])

    create table(:brand, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :theme_id, references(:themes, type: :uuid, on_delete: :restrict)

      timestamps()
    end

    create table(:user_themes, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :theme_id, references(:themes, type: :uuid, on_delete: :delete_all)
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:user_themes, [:user_id])
  end
end
