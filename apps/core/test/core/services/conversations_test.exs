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

      assert Conversations.get_participant(user.id, conv.id)

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

  describe "delete_conversation/2" do
    test "participants can delete conversations" do
      user = insert(:user)
      conversation = insert(:conversation)
      insert(:participant, user: user, conversation: conversation)

      {:ok, deleted} = Conversations.delete_conversation(conversation.id, user)

      assert deleted.id == conversation.id
      assert deleted.name == conversation.name

      assert_receive {:event, %PubSub.ConversationDeleted{item: ^deleted}}
    end

    test "Nonparticipants cannot delete conversations" do
      user = insert(:user)
      conversation = insert(:conversation)

      {:error, _} = Conversations.delete_conversation(conversation.id, user)
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

    test "you can mention other users by their handle" do
      user = insert(:user)
      dwight = insert(:user, handle: "dwight")
      jim = insert(:user, handle: "jim")
      conversation = insert(:conversation)

      {:ok, msg} = Conversations.create_message(conversation.id, %{text: "@jim give @dwight his stapler back"}, user)
      entities = Enum.sort_by(msg.entities, & &1.start_index)

      assert length(entities) == 2
      assert Enum.all?(entities, & &1.type == :mention)
      assert Enum.map(entities, & &1.user_id) |> ids_equal([jim, dwight])
      assert [0, 10] == Enum.map(entities, & &1.start_index)
      assert [4, 7] == Enum.map(entities, & &1.length)
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

  describe "#update_participant" do
    test "A user can update their own participants" do
      part = insert(:participant)

      {:ok, updated} = Conversations.update_participant(
        part.conversation_id,
        part.user_id,
        %{notification_preferences: %{mention: false}},
        part.user
      )

      refute updated.notification_preferences.mention
    end

    test "Other users cannot update" do
      part = insert(:participant)

      {:error, _} = Conversations.update_participant(
        part.conversation_id,
        part.user_id,
        %{notification_preferences: %{mention: false}},
        insert(:user)
      )
    end
  end
end