defmodule Core.Schema.InviteMutationsTest do
  use Core.DataCase, async: true

  describe "createInvite" do
    test "A participant can create an invite" do
      %{user: user, conversation: conv} = insert(:participant)

      {:ok, %{data: %{"createInvite" => result}}} = run_query("""
        mutation CreateInvite($reference: String!) {
          createInvite(attributes: {type: CONVERSATION, reference: $reference}) {
            id
            token
            creator {
              id
            }
          }
        }
      """, %{"reference" => conv.id}, %{current_user: user})

      assert result["creator"]["id"] == user.id
      assert result["token"]

      invitee = insert(:user)
      {:ok, participant} = Core.Services.Invites.realize_from_token(result["token"], invitee)

      assert participant.conversation_id == conv.id
      assert participant.user_id == invitee.id
    end
  end
end