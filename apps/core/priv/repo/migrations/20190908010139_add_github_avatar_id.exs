defmodule Core.Repo.Migrations.AddGithubAvatarId do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :avatar_id, :uuid
    end 
  end
end
