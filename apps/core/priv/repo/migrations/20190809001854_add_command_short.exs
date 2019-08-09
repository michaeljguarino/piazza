defmodule Core.Repo.Migrations.AddCommandShort do
  use Ecto.Migration

  def change do
    alter table(:commands) do
      add :description, :string
    end
  end
end
