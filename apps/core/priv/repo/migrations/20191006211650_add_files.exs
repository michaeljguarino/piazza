defmodule Core.Repo.Migrations.AddFiles do
  use Ecto.Migration

  def change do
    create table(:files, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :message_id, references(:messages, type: :uuid, on_delete: :delete_all)
      add :object_id, :uuid
      add :object, :string
      add :media_type, :integer
      add :filename, :string
      add :filesize, :bigint

      timestamps()
    end

    create unique_index(:files, [:message_id])
  end
end
