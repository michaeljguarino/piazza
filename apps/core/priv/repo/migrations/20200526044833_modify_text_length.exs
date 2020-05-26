defmodule Core.Repo.Migrations.ModifyTextLength do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      modify :text, :string, size: 10_000
    end
  end
end
