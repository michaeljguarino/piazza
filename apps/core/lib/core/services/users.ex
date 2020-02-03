defmodule Core.Services.Users do
  use Core.Services.Base
  alias Core.Models.{User, ResetToken}
  alias Core.PubSub
  import Core.Policies.User

  @type user_resp :: {:ok, User.t} | error

  @spec get_user(binary) :: User.t | nil
  def get_user(id), do: Core.Repo.get(User, id)

  @spec get_user_by_email(binary) :: User.t | nil
  def get_user_by_email(email), do: Core.Repo.get_by(User, email: email)

  @spec get_user_by_handle(binary) :: User.t | nil
  def get_user_by_handle(handle), do: Core.Repo.get_by(User, handle: handle)

  @spec get_users_by_handles([binary]) :: [User.t]
  def get_users_by_handles(handles) do
    User.with_handles(handles)
    |> Core.Repo.all()
  end

  @spec get_user!(binary) :: User.t
  def get_user!(id), do: Core.Repo.get!(User, id)

  @spec get_user_by_email!(binary) :: User.t
  def get_user_by_email!(email), do: Core.Repo.get_by!(User, email: email)

  @spec get_users_by_id([binary]) :: [User.t]
  def get_users_by_id(user_ids) do
    User.for_ids(user_ids)
    |> Core.Repo.all()
  end

  @spec get_reset_token!(binary) :: ResetToken.t
  def get_reset_token!(id), do: Core.Repo.get_by!(ResetToken, secure_id: id)

  @doc """
  Checks if the password is valid and returns a tagged tuple
  with the user if so.
  """
  @spec login_user(binary, binary) :: user_resp
  def login_user(email, password) do
    with %User{deleted_at: nil} = user <- get_user_by_email!(email),
         {:ok, user} <- Argon2.check_pass(user, password) do
      {:ok, user}
    else
      %User{} -> {:error, :not_found}
      _ -> {:error, :invalid_password}
    end
  end

  @doc """
  Creates a new user record, performed on behalf of another user

  allowed roles:
  * admin
  """
  @spec create_user(map, User.t) :: user_resp
  def create_user(attrs, user) do
    %User{}
    |> User.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
    |> notify(:create)
  end


  @doc """
  Creates a user within the context of a signup
  """
  @spec create_user(map) :: user_resp
  def create_user(attrs) do
    %User{}
    |> User.changeset(attrs)
    |> Core.Repo.insert()
    |> notify(:create)
  end

  @doc """
  Updates a user by id

  allowed roles;
  * self
  * admin
  """
  @spec update_user(binary, map, User.t) :: user_resp
  def update_user(id, attrs, user) do
    Core.Repo.get!(User, id)
    |> User.changeset(attrs)
    |> allow(user, :update)
    |> when_ok(:update)
    |> notify(:update)
  end

  @doc """
  Removes a user from the instance.  Note: this is a soft delete,
  and really just prevents logins.

  allowed roles:
  * admin
  * self
  """
  @spec delete_user(binary, User.t) :: user_resp
  def delete_user(id, user) do
    get_user!(id)
    |> Ecto.Changeset.change(%{deleted_at: DateTime.utc_now()})
    |> allow(user, :delete)
    |> when_ok(:update)
  end

  @doc """
  Creates a generic reset token for an email
  """
  @spec create_reset_token(map) :: {:ok, ResetToken.t} | {:error, term}
  def create_reset_token(attrs) do
    %ResetToken{}
    |> ResetToken.changeset(attrs)
    |> Core.Repo.insert()
    |> notify(:create)
  end

  @doc """
  Generic application of reset tokens
  """
  @spec apply_reset_token(ResetToken.t | binary, map) :: user_resp
  def apply_reset_token(%ResetToken{type: :password, user: user} = token, %{password: _} = args) do
    start_transaction()
    |> add_operation(:apply, fn _ ->
      user
      |> User.changeset(args)
      |> Core.Repo.update()
    end)
    |> add_operation(:del, fn _ -> Core.Repo.delete(token) end)
    |> execute(extract: :apply)
  end

  def apply_reset_token(token, args) when is_binary(token) do
    get_reset_token!(token)
    |> Core.Repo.preload([:user])
    |> apply_reset_token(args)
  end

  def notify({:ok, %ResetToken{type: :password} = token}, :create),
    do: handle_notify(PubSub.PasswordReset, token)
  def notify({:ok, user}, :create), do: handle_notify(PubSub.UserCreated, user)
  def notify({:ok, user}, :update), do: handle_notify(PubSub.UserUpdated, user, actor: user)
  def notify(error, _), do: error
end