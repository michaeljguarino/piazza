defmodule GraphQl.Resolvers.Brand do
  use GraphQl.Resolvers.Base, model: Core.Models.Brand
  alias Core.Services.Brand, as: BrandService
  alias Core.Models.{Brand, UserTheme, Theme}

  def query(Brand, _), do: Brand
  def query(Theme, _), do: Theme
  def query(UserTheme, _), do: UserTheme

  def resolve_brand(_, _), do: {:ok, BrandService.get_brand!()}

  def resolve_license(_, _), do: {:ok, Piazza.Crypto.License.fetch().policy}

  def update_brand(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: BrandService.update_brand(attrs, user)

  def list_themes(args, _) do
    Theme.ordered()
    |> paginate(args)
  end

  def get_theme(brand, %{context: %{current_user: user}}),
    do: {:ok, BrandService.get_theme_for_user(user.id, brand)}
  def get_theme(brand, _) do
    %{theme: theme} = Core.Repo.preload(brand, [:theme])
    {:ok, theme}
  end

  def create_theme(%{attributes: attrs, name: name}, %{context: %{current_user: user}}),
    do: BrandService.create_theme(attrs, name, user)

  def set_theme(%{id: theme_id}, %{context: %{current_user: user}}) do
    with {:ok, user_theme} <- BrandService.set_theme(theme_id, user) do
      %{theme: theme} = Core.Repo.preload(user_theme, [:theme])
      {:ok, theme}
    end
  end
end