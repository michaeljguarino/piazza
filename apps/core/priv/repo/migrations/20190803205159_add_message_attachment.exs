defmodule Core.Repo.Migrations.AddMessageAttachment do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add :attachment, :string
    end
  end
end
