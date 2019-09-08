defmodule Core.Repo.Migrations.AddInstallableCommands do
  use Ecto.Migration

  def change do
    create table(:installable_commands, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :name, :string
      add :description, :string
      add :documentation, :string
      add :avatar, :string
      add :webhook, :string

      timestamps()
    end

    create unique_index(:installable_commands, [:name])
  end
end
