defmodule Core.Repo.Migrations.AddResetTokens do
  use Ecto.Migration

  def change do
    create table(:reset_tokens, primary_key: false) do
      add :id,        :uuid, primary_key: true
      add :type,      :integer, null: false
      add :secure_id, :string
      add :email,     references(:users,
        column: :email, type: :string, foreign_key: :email, on_delete: :delete_all)

      timestamps()
    end

    create unique_index(:reset_tokens, [:secure_id])
    create index(:reset_tokens, [:email])
  end
end
