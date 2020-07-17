defmodule Core.Repo.Migrations.AddUnfurlers do
  use Ecto.Migration

  def change do
    create table(:unfurlers, primary_key: false) do
      add :id,         :uuid, primary_key: true
      add :command_id, references(:commands, type: :uuid, on_delete: :delete_all)
      add :regex,      :string
      add :value,      :string

      timestamps()
    end

    create index(:unfurlers, [:command_id])
  end
end
