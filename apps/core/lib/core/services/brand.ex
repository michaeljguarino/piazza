defmodule Core.Services.Brand do
  use Core.Services.Base
  import Core.Policies.Brand, only: [allow: 3]
  alias Core.Models.{Theme, UserTheme, Brand}

  @doc """
  Gets the singleton brand object
  """
  @spec get_brand!() :: Brand.t
  def get_brand!() do
    Brand.first()
    |> Core.Repo.one!()
  end

  @doc """
  Fetches the associated theme for a user, otherwise falls
  back to the theme on `brand`
  """
  @spec get_theme_for_user(binary, Brand.t) :: Theme.t
  def get_theme_for_user(user_id, %Brand{} = brand) do
    case get_user_theme(user_id) do
      nil -> brand
      %UserTheme{} = ut -> ut
    end
    |> Core.Repo.preload([:theme])
    |> Map.get(:theme)
  end


  @doc """
  Get's the user_themes record for the given user
  """
  @spec get_user_theme(binary) :: UserTheme.t
  def get_user_theme(user_id) do
    Core.Repo.get_by(UserTheme, user_id: user_id)
  end


  @doc """
  Updates the given brand.

  roles allowed:
  * admin
  """
  @spec update_brand(map, User.t) :: {:ok, Brand.t} | error
  def update_brand(attrs, user) do
    get_brand!()
    |> Brand.changeset(attrs)
    |> allow(user, :update)
    |> when_ok(:update)
  end

  @doc """
  Creates a new theme for this instance

  roles allowed:
  * all
  """
  @spec create_theme(map, binary, User.t) :: {:ok, Theme.t} | error
  def create_theme(attrs, name, user) do
    start_transaction()
    |> add_operation(:theme, fn _ ->
      %Theme{creator_id: user.id, name: name}
      |> Theme.changeset(attrs)
      |> Core.Repo.insert(
        on_conflict: :replace_all_except_primary_key,
        conflict_target: [:name]
      )
    end)
    |> add_operation(:user_theme, fn %{theme: %{id: id}} ->
      set_theme(id, user)
    end)
    |> execute(extract: :theme)
  end

  @doc """
  Sets the theme for this user

  roles allowed:
  * all
  """
  @spec set_theme(binary, User.t) :: {:ok, UserTheme.t} | error
  def set_theme(theme_id, user) do
    %UserTheme{}
    |> UserTheme.changeset(%{theme_id: theme_id, user_id: user.id})
    |> Core.Repo.insert(on_conflict: :replace_all_except_primary_key, conflict_target: [:user_id])
  end
end