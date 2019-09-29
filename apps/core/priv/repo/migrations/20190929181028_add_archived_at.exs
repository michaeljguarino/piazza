defmodule Core.Repo.Migrations.AddArchivedAt do
  use Ecto.Migration

  def change do
    alter table(:conversations) do
      add :archived_at, :utc_datetime_usec
    end
  end
end
