defmodule Core.Repo.Migrations.AddParticipantLastSeen do
  use Ecto.Migration

  def change do
    alter table(:participants) do
      add :last_seen_at, :utc_datetime_usec
    end
  end
end
