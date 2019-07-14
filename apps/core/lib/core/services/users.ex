defmodule Core.Services.Users do
  use Core.Services.Base
  alias Core.Models.User
  import Core.Policies.User

  def create_user(attrs) do
    %User{}
    |> User.changeset(attrs)
    |> Core.Repo.insert()
  end

  def update_user(id, attrs, user) do
    Core.Repo.get!(User, id)
    |> User.changeset(attrs)
    |> allow(user, :update)
    |> when_ok(:update)
  end
end