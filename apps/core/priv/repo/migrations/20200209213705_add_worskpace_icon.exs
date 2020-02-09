defmodule Core.Repo.Migrations.AddWorskpaceIcon do
  use Ecto.Migration

  def change do
    alter table(:workspaces) do
      add :icon,    :string
      add :icon_id, :uuid
    end
  end
end
