defmodule GraphQl.NotificationMutationsTest do
  use GraphQl.SchemaCase, async: true

  describe "viewNotifications" do
    test "It will mark a user's notifications as viewed" do
      user = insert(:user)
      notifications = insert_list(2, :notification, user: user)
      insert(:notification)

      {:ok, %{data: %{"viewNotifications" => result}}} = run_q("""
        mutation {
          viewNotifications {
            id
            message {
              text
            }
            user {
              id
            }
          }
        }
      """, %{}, %{current_user: user})

      assert ids_equal(result, notifications)
      assert Enum.all?(notifications, &refetch(&1).seen_at)
    end
  end
end