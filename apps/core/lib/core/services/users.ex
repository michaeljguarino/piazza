defmodule Core.Services.Users do
  use Core.Services.Base
  alias Core.Models.User
  alias Core.PubSub
  import Core.Policies.User

  def create_user(attrs) do
    %User{}
    |> User.changeset(attrs)
    |> Core.Repo.insert()
    |> notify(:create)
  end

  def update_user(id, attrs, user) do
    Core.Repo.get!(User, id)
    |> User.changeset(attrs)
    |> allow(user, :update)
    |> when_ok(:update)
    |> notify(:update)
  end

  def notify({:ok, user}, :create), do: handle_notify(PubSub.UserCreated, user)
  def notify({:ok, user}, :update), do: handle_notify(PubSub.UserUpdated, user, actor: user)
  def notify(error, _), do: error
end