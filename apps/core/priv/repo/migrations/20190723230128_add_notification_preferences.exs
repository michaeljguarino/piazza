defmodule Core.Repo.Migrations.AddNotificationPreferences do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :notification_preferences, :map
    end

    alter table(:participants) do
      add :notification_preferences, :map
    end
  end
end
