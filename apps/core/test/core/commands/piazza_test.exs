defmodule Core.Commands.PiazzaTest do
  use Core.DataCase, async: true
  alias Core.Commands.Piazza
  alias Core.Services.Conversations

  describe "invite" do
    setup [:setup_piazza]

    test "it can add a user as a participant in the current conversation" do
      user         = insert(:user)
      conversation = insert(:conversation)
      msg          = insert(:message, conversation: conversation)

      {:ok, _message} = Piazza.dispatch(json_map(msg), "invite", [user.handle])

      assert Conversations.get_participant(user.id, conversation.id)
    end
  end

  describe "boot" do
    setup [:setup_piazza]

    test "it can add a user as a participant in the current conversation" do
      user         = insert(:user)
      participant  = insert(:participant, user: user)
      msg = insert(:message, conversation: participant.conversation)

      {:ok, _message} = Piazza.dispatch(json_map(msg), "boot", [user.handle])

      refute refetch(participant)
    end
  end

  describe "documentation" do
    test "It will generate docs" do
      docs = Piazza.documentation()

      assert docs =~ "invite"
      assert docs =~ "boot"
    end
  end

  defp json_map(msg) do
    with {:ok, encoded} <- Jason.encode(msg),
      do: Jason.decode!(encoded)
  end

  defp setup_piazza(_), do: [piazza: insert(:user, handle: "piazza", roles: %{admin: true})]
end