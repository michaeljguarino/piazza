defmodule Core.Services.Brand do
  use Core.Services.Base
  import Core.Policies.Brand, only: [allow: 3]
  alias Core.Models.{Theme, UserTheme, Brand}

  def get_brand!() do
    Brand.first()
    |> Core.Repo.one!()
  end

  def get_theme_for_user(user_id, %Brand{} = brand) do
    case get_user_theme(user_id) do
      nil -> brand
      %UserTheme{} = ut -> ut
    end
    |> Core.Repo.preload([:theme])
    |> Map.get(:theme)
  end

  def get_user_theme(user_id) do
    Core.Repo.get_by(UserTheme, user_id: user_id)
  end

  def update_brand(attrs, user) do
    get_brand!()
    |> Brand.changeset(attrs)
    |> allow(user, :update)
    |> when_ok(:update)
  end

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

  def set_theme(theme_id, user) do
    %UserTheme{}
    |> UserTheme.changeset(%{theme_id: theme_id, user_id: user.id})
    |> Core.Repo.insert(on_conflict: :replace_all_except_primary_key, conflict_target: [:user_id])
  end
end