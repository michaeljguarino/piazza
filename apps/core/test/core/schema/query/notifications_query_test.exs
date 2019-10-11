defmodule Core.Schema.NotificationsQueryTest do
  use Core.DataCase, async: true

  describe "notifications" do
    test "it will paginate notifications for a user" do
      user = insert(:user)
      now = Timex.now()
      notifications = for day <- 1..3,
        do: insert(:notification, user: user, inserted_at: Timex.shift(now, days: -day))

      insert_list(2, :notification)
      expected = Enum.take(notifications, 2)

      {:ok, %{data: %{"notifications" => notifications}}} = run_query("""
        query {
          notifications(first: 2) {
            edges {
              node {
                id
                message {
                  text
                }
              }
            }
          }
        }
      """, %{}, %{current_user: user})

      notifications = from_connection(notifications)
      assert Enum.all?(notifications, & &1["message"]["text"])
      assert ids_equal(notifications, expected)
    end
  end
end