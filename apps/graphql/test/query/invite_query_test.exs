defmodule GraphQl.InvitesQueryTest do
  use GraphQl.SchemaCase, async: true

  describe "invite" do
    test "it can fetch an invite" do
      invite = insert(:invite)

      {:ok, %{data: %{"invite" => inv}}} = run_q("""
        query Invite($id: ID!) {
          invite(id: $id) {
            id
          }
        }
      """, %{"id" => invite.external_id})

      assert inv["id"] == invite.id
    end
  end
end