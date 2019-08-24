defmodule Core.Repo.Migrations.AddInviteTable do
  use Ecto.Migration

  def change do
    create table(:invites, primary_key: false) do
      add :id,          :uuid, primary_key: true
      add :type,        :integer
      add :external_id, :string, null: false
      add :reference,   :uuid
      add :creator_id,  references(:users, type: :uuid)

      timestamps()
    end

    create unique_index(:invites, [:external_id])
  end
end
