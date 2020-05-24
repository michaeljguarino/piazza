defmodule Core.Repo.Migrations.AddFileDimensions do
  use Ecto.Migration

  def change do
    alter table(:files) do
      add :width,  :integer, default: 0
      add :height, :integer, default: 0
    end
  end
end
