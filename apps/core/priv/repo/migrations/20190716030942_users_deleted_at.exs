defmodule Core.Repo.Migrations.UsersDeletedAt do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :deleted_at, :utc_datetime_usec
    end
  end
end
