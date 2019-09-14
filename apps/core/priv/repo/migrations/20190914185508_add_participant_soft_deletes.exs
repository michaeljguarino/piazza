defmodule Core.Repo.Migrations.AddParticipantSoftDeletes do
  use Ecto.Migration

  def change do
    alter table(:participants) do
      add :deleted_at, :utc_datetime_usec
    end
  end
end
