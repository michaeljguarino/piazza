defmodule Core.Repo.Migrations.AddStructuredMsg do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add :structured_message, :map
    end
  end
end
