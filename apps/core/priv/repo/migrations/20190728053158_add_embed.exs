defmodule Core.Repo.Migrations.AddEmbed do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add :embed, :map
    end
  end
end
