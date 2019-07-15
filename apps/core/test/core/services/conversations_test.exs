defmodule Core.Services.ConversationsTest do
  use Core.DataCase, async: true
  alias Core.Services.Conversations
  alias Core.PubSub

  describe "create_conversation/2" do
    test "Users can create conversations" do
      user = insert(:user)
      {:ok, conv} = Conversations.create_conversation(%{name: "my conversation"}, user)

      assert conv.name == "my conversation"
      assert conv.creator_id == user.id

      assert_receive {:event, %PubSub.ConversationCreated{item: ^conv}}
    end
  end

  describe "update_conversation/2" do
    test "participants can update conversations" do
      user = insert(:user)
      conversation = insert(:conversation)
      insert(:participant, user: user, conversation: conversation)

      {:ok, updated} = Conversations.update_conversation(conversation.id, %{name: "my conversation"}, user)

      assert updated.id == conversation.id
      assert updated.name == "my conversation"

      assert_receive {:event, %PubSub.ConversationUpdated{item: ^updated}}
    end

    test "Nonparticipants cannot update conversations" do
      user = insert(:user)
      conversation = insert(:conversation)

      {:error, _} = Conversations.update_conversation(conversation.id, %{name: "my conversation"}, user)
    end
  end

  describe "create_message/3" do
    test "Anyone can create messages in public conversations" do
      user = insert(:user)
      conversation = insert(:conversation)

      {:ok, message} = Conversations.create_message(conversation.id, %{text: "new message"}, user)

      assert message.text == "new message"
      assert message.creator_id == user.id

      assert_receive {:event, %PubSub.MessageCreated{item: ^message}}
    end

    test "Participants can create messages in private conversations" do
      user = insert(:user)
      conversation = insert(:conversation, public: false)
      insert(:participant, user: user, conversation: conversation)

      {:ok, message} = Conversations.create_message(conversation.id, %{text: "new message"}, user)

      assert message.text == "new message"
      assert message.creator_id == user.id
    end

    test "Nonparticipants cannot create messages in private conversations" do
      user = insert(:user)
      conversation = insert(:conversation, public: false)

      {:error, _} = Conversations.create_message(conversation.id, %{text: "new message"}, user)
    end
  end

  describe "#create_participant/2" do
    test "Participants can create other participants" do
      user         = insert(:user)
      conversation = insert(:conversation)
      other_user   = insert(:user)
      insert(:participant, user: user, conversation: conversation)

      {:ok, participant} = Conversations.create_participant(%{
        conversation_id: conversation.id,
        user_id: other_user.id
      }, user)

      assert participant.user_id == other_user.id
      assert participant.conversation_id == conversation.id

      assert_receive {:event, %PubSub.ParticipantCreated{item: ^participant}}
    end

    test "Nonparticipants cannot create participants" do
      user         = insert(:user)
      conversation = insert(:conversation)
      other_user   = insert(:user)

      {:error, _} = Conversations.create_participant(%{
        conversation_id: conversation.id,
        user_id: other_user.id
      }, user)
    end
  end

  describe "#delete_participant/3" do
    test "Participants can delete other participants" do
      user         = insert(:user)
      conversation = insert(:conversation)
      participant  = insert(:participant, conversation: conversation)
      insert(:participant, user: user, conversation: conversation)

      {:ok, participant} = Conversations.delete_participant(conversation.id, participant.user_id, user)

      refute refetch(participant)

      assert_receive {:event, %PubSub.ParticipantDeleted{item: ^participant}}
    end

    test "Nonparticipants cannot delete participants" do
      user         = insert(:user)
      conversation = insert(:conversation)
      participant  = insert(:participant, conversation: conversation)

      {:error, _} = Conversations.delete_participant(conversation.id, participant.user_id, user)
    end
  end
end