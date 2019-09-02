defmodule Core.Schema.BrandMutationsTest do
  use Core.DataCase, async: true

  describe "create_theme" do
    test "A user can create a new theme" do
      theme_attrs =
        Core.Models.Theme.theme_fields()
        |> Enum.map(&Absinthe.Utils.camelize(Atom.to_string(&1), lower: true))
        |> Enum.into(%{}, & {&1, "#adadada"})

      {:ok, %{data: %{"createTheme" => theme}}} = run_query("""
        mutation CreateTheme($themeAttributes: ThemeAttributes!, $name: String!) {
          createTheme(attributes: $themeAttributes, name: $name) {
            id
            name
            sidebar
            sidebarHover
          }
        }
      """, %{"themeAttributes" => theme_attrs, "name" => "piazza"}, %{current_user: insert(:user)})

      assert theme["sidebar"] == theme_attrs["sidebar"]
      assert theme["sidebarHover"] == theme_attrs["sidebarHover"]
    end
  end

  describe "set_theme" do
    test "A user can set his theme" do
      theme = insert(:theme)

      {:ok, %{data: %{"setTheme" => updated}}} = run_query("""
        mutation SetTheme($id: ID!) {
          setTheme(id: $id) {
            id
          }
        }
      """, %{"id" => theme.id}, %{current_user: insert(:user)})

      assert updated["id"] == theme.id
    end
  end
end