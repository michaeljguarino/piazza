defmodule Core.Repo.Migrations.AdminUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :roles, :map
    end
  end
end
