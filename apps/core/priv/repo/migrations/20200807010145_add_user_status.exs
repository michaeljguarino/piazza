defmodule Core.Repo.Migrations.AddUserStatus do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :status, :map
      add :status_expires_at, :utc_datetime_usec
    end

    create index(:users, [:status_expires_at])
  end
end
