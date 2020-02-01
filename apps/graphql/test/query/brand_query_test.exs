defmodule GraphQl.BrandQueryTest do
  use GraphQl.SchemaCase, async: true

  describe "brand" do
    test "It will sideload the brand theme" do
      brand = insert(:brand)

      {:ok, %{data: %{"brand" => found}}} = run_q("""
        query {
          brand {
            license {
              features {
                name
                description
              }
              limits {
                user
              }
            }
            theme {
              id
            }
          }
        }
      """, %{}, %{})

      assert found["theme"]["id"] == brand.theme_id
      %{"features" => [%{"description" => _, "name" => "sso"}], "limits" => %{"user" => 2}} = found["license"]
    end

    test "It will sideload the current user's theme" do
      insert(:brand)
      %{user: user, theme: theme} = insert(:user_theme)
      {:ok, %{data: %{"brand" => found}}} = run_q("""
        query {
          brand {
            theme {
              id
            }
          }
        }
      """, %{}, %{current_user: user})

      assert found["theme"]["id"] == theme.id
    end
  end

  describe "themes" do
    test "It will list the themes in the system" do
      themes = insert_list(3, :theme)

      {:ok, %{data: %{"themes" => found}}} = run_q("""
        query {
          themes(first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{}, %{current_user: insert(:user)})

      found_themes = from_connection(found)
      assert ids_equal(found_themes, themes)
    end
  end
end