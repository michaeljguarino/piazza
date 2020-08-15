defmodule Core.Repo.Migrations.AddFileContentType do
  use Ecto.Migration

  def change do
    alter table(:files) do
      add :content_type, :string
    end
  end
end
