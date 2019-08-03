defmodule Core.Repo.Migrations.AddUuidToMessages do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add :attachment_id, :uuid
    end
  end
end
