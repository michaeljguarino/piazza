defmodule Core.Repo.Migrations.AddUserAttrs do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :phone, :string
      add :title, :string
    end
  end
end
