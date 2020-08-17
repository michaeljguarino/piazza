defmodule Core.Services.InvitesTest do
  use Core.DataCase, async: true
  alias Core.Services.Invites

  describe "#create_invite/2" do
    test "Participants can create invite links for conversations" do
      %{user: user, conversation: conv} = insert(:participant)

      {:ok, invite} = Invites.create_invite(:conversation, conv.id, user)

      assert invite.reference == conv.id
      assert invite.creator_id == user.id
      assert invite.type == :conversation
    end

    test "Nonparticipants cannot create conversation invites" do
      conv = insert(:conversation)

      {:error, _} = Invites.create_invite(:conversation, conv.id, insert(:user))
    end
  end

  describe "#realize/2" do
    test "Conversation invites will add a user as a participant" do
      %{user: user, conversation: conv} = insert(:participant)
      invite  = insert(:invite, reference: conv.id, creator: user)
      invitee = insert(:user)

      {:ok, participant} = Invites.realize(invite, invitee)

      assert participant.user_id == invitee.id
      assert participant.conversation_id == conv.id

      refute refetch(invite)
    end
  end
end