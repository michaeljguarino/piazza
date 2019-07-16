defmodule Core.Services.Users do
  use Core.Services.Base
  alias Core.Models.User
  alias Core.PubSub
  import Core.Policies.User

  def get_user(id), do: Core.Repo.get(User, id)

  def get_user_by_email(email), do: Core.Repo.get_by(User, email: email)

  def get_user_by_handle(handle), do: Core.Repo.get_by(User, handle: handle)

  def get_user!(id), do: Core.Repo.get!(User, id)

  def get_user_by_email!(email), do: Core.Repo.get_by!(User, email: email)

  def login_user(email, password) do
    get_user_by_email!(email)
    |> Argon2.check_pass(password)
    |> case do
      {:ok, user} -> {:ok, user}
      {:error, _} -> {:error, :invalid_password}
    end
  end

  def create_user(attrs, user) do
    %User{}
    |> User.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
    |> notify(:create)
  end

  def update_user(id, attrs, user) do
    Core.Repo.get!(User, id)
    |> User.changeset(attrs)
    |> allow(user, :update)
    |> when_ok(:update)
    |> notify(:update)
  end

  def delete_user(id, user) do
    get_user!(id)
    |> Ecto.Changeset.change(%{deleted_at: DateTime.utc_now()})
    |> allow(user, :delete)
    |> when_ok(:update)
  end

  def notify({:ok, user}, :create), do: handle_notify(PubSub.UserCreated, user)
  def notify({:ok, user}, :update), do: handle_notify(PubSub.UserUpdated, user, actor: user)
  def notify(error, _), do: error
end