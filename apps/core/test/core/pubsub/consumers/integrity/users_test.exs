defmodule Core.PubSub.Consumers.Integrity.UsersTest do
  use Core.DataCase
  alias Core.PubSub
  alias PubSub.Consumers.Integrity
  alias Core.Services.Conversations


  describe "UserCreated" do
    test "It will add the user to all global conversations" do
      globals = insert_list(3, :conversation, global: true)
      ignored = insert(:conversation)
      user    = insert(:user)

      event = %PubSub.UserCreated{item: user}
      3 = Integrity.handle_event(event)

      for %{id: conv_id} <- globals,
        do: assert Conversations.get_participant(user.id, conv_id)

      refute Conversations.get_participant(user.id, ignored.id)
    end
  end
end