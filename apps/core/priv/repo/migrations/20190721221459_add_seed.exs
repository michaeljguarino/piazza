defmodule Core.Repo.Migrations.AddSeed do
  use Ecto.Migration

  def change do
    create table(:seed) do
      add :name, :string
      add :inserted_at, :utc_datetime_usec
    end
  end
end
