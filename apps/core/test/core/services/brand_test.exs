defmodule Core.Services.BrandTest do
  use Core.DataCase, async: true
  alias Core.Services.Brand
  alias Core.Models.Theme

  describe "#create_theme" do
    test "users can create themes" do
      attrs = Theme.theme_fields() |> Enum.into(%{}, & {&1, "#adadada"})
      user = insert(:user)

      {:ok, theme} = Brand.create_theme(attrs, "my_theme", user)

      for {name, attr} <- attrs,
        do: assert Map.get(theme, name) == attr

      assert theme.creator_id == user.id
      assert Brand.get_user_theme(user.id).theme_id == theme.id
    end
  end

  describe "#set_theme" do
    test "It will update the user's current theme" do
      %{user: user} = insert(:user_theme)
      theme = insert(:theme)

      {:ok, current_theme} = Brand.set_theme(theme.id, user)

      assert current_theme.user_id == user.id
      assert current_theme.theme_id == theme.id
    end
  end

  describe "#update_brand" do
    test "admins can set the brand's theme" do
      insert(:brand)
      theme = insert(:theme)
      admin = insert(:user, roles: %{admin: true})

      {:ok, brand} = Brand.update_brand(%{theme_id: theme.id}, admin)

      assert brand.theme_id == theme.id
    end

    test "Non-admins cannot update" do
      insert(:brand)
      theme = insert(:theme)
      user  = insert(:user)

      {:error, _} = Brand.update_brand(%{theme_id: theme.id}, user)
    end
  end
end