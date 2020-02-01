defmodule GraphQl.PlanQueryTest do
  use GraphQl.SchemaCase, async: true

  describe "plan" do
    test "Admins can query plan" do
      admin = insert(:user, roles: %{admin: true})

      {:ok, %{data: %{"plan" => plan}}} = run_q("""
        query {
          plan {
            license {
              features {
                name
              }
              limits {
                user
              }
            }
            usage {
              user
            }
          }
        }
      """, %{}, %{current_user: admin})

      [%{"name" => "sso"}] = plan["license"]["features"]
      assert plan["license"]["limits"]["user"] == 2

      assert plan["usage"]["user"] == 1
    end
  end
end