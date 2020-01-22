defmodule Core.Repo.Migrations.AddNeglectedIndices do
  use Ecto.Migration

  def change do
    create index(:participants, [:user_id])
  end
end
