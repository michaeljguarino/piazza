defmodule Core.Repo.Migrations.AddConvGlobal do
  use Ecto.Migration

  def change do
    alter table(:conversations) do
      add :global, :boolean, default: false, null: false
    end
  end
end
