defmodule Core.Repo.Migrations.AddAvatar do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :avatar, :string
    end
  end
end
