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

  describe "#create_chat/2" do
    test "A user can create a chat with another user" do
      user = insert(:user)
      other_user = insert(:user)

      {:ok, conv} = Conversations.create_chat(other_user.id, user)

      refute conv.public
      assert Conversations.get_participant(other_user.id, conv.id).notification_preferences.message
      assert Conversations.get_participant(user.id, conv.id).notification_preferences.message
      assert_receive {:event, %PubSub.ConversationCreated{item: ^conv}}
    end

    test "It will invite a list of other users" do
      user = insert(:user)
      other_users = insert_list(3, :user)

      {:ok, conv} = Conversations.create_chat(Enum.map(other_users, & &1.id), user)

      for user <- other_users,
        do: assert Conversations.get_participant(user.id, conv.id)
    end

    test "It will upsert against existing chats" do
      user       = insert(:user)
      other_user = insert(:user)

      {:ok, existing} = Conversations.create_chat(other_user.id, user)

      {:ok, conv} = Conversations.create_chat(other_user.id, user)

      assert conv.id == existing.id
      assert conv.chat
      assert conv.chat_dedupe_key
      refute conv.public
      assert Conversations.get_participant(user.id, conv.id)
      assert Conversations.get_participant(other_user.id, conv.id)

      assert_receive {:event, %PubSub.ConversationUpdated{item: ^conv}}
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

    test "It can modify the archived timestamp" do
      user = insert(:user)
      conversation = insert(:conversation)
      insert(:participant, user: user, conversation: conversation)

      {:ok, updated} = Conversations.update_conversation(conversation.id, %{archived: true}, user)

      assert updated.archived_at
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

    test "Creating replies bump the parent's reply count" do
      user = insert(:user)
      conv = insert(:conversation)
      msg  = insert(:message, conversation: conv)
      insert(:participant, user: user, conversation: conv)

      {:ok, reply} = Conversations.create_message(conv.id, %{text: "a reply", parent_id: msg.id}, user)

      assert reply.parent_id == msg.id
      assert reply.conversation_id == conv.id
      assert reply.text == "a reply"

      assert refetch(msg).reply_count == 1
    end

    test "Structured messages can be defined with xml" do
      %{user: user, conversation: conversation} = insert(:participant)

      url = "https://media2.giphy.com/media/35LCfBhoYD0uuDmZWG/giphy.mp4"

      {:ok, message} = Conversations.create_message(conversation.id, %{
        text: "structured message",
        structured_message: """
          <root>
            <box pad="small">
              <link href='#{url}' target="_blank">
                <video url='#{url}' autoPlay="true" loop="true" />
              </link>
            </box>
          </root>
        """
      }, user)

      %{"_type" => "root", "children" => [
        %{"_type" => "box", "children" => [
          %{"_type" => "link", "children" => [
            %{"_type" => "video", "attributes" => %{"url" => ^url}}
          ]}
        ]}
      ]} = message.structured_message
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


    test "It can extract emoji" do
      user = insert(:user)
      conv = insert(:conversation)
      emoji = insert(:emoji, name: "michael")

      {:ok, %{entities: [entity]}} = Conversations.create_message(conv.id, %{text: "whoa :michael:"}, user)

      assert entity.type == :emoji
      assert entity.start_index == 5
      assert entity.length == 9
      assert entity.text == "michael"
      assert entity.emoji_id == emoji.id
    end

    test "It can mention entire channels" do
      user = insert(:user)
      conv = insert(:conversation)

      {:ok, %{entities: [entity]}} = Conversations.create_message(conv.id, %{text: "hey @here"}, user)

      assert entity.type == :channel_mention
      assert entity.start_index == 4
      assert entity.length == 5
      assert entity.text == "here"
    end
  end

  describe "#update_message/3" do
    test "The message creator can update messages" do
      msg = insert(:message)

      {:ok, updated} = Conversations.update_message(msg.id, %{text: "updated"}, msg.creator)

      assert updated.id == msg.id
      assert updated.text == "updated"

      assert_receive {:event, %PubSub.MessageUpdated{item: ^updated}}
    end

    test "Other users cannot update" do
      msg  = insert(:message)
      user = insert(:user)
      insert(:participant, user: user, conversation: msg.conversation)

      {:error, _} = Conversations.update_message(msg.id, %{text: "updated"}, user)
    end
  end

  describe "#delete_message/2" do
    test "Users can delete their own messages" do
      user = insert(:user)
      msg = insert(:message, creator: user)

      {:ok, deleted} = Conversations.delete_message(msg.id, user)

      assert msg.id == deleted.id
      refute refetch(msg)

      assert_receive {:event, %PubSub.MessageDeleted{item: ^deleted}}
    end

    test "Users can delete their others' messages" do
      user = insert(:user)
      msg = insert(:message)

      {:error, _} = Conversations.delete_message(msg.id, user)
    end

    test "Admins can delete messages" do
      user = insert(:user, roles: %{admin: true})

      msg = insert(:message)

      {:ok, deleted} = Conversations.delete_message(msg.id, user)

      assert msg.id == deleted.id
      refute refetch(msg)
    end
  end

  describe "#toggle_pin/2" do
    test "Participants can pin a message" do
      user = insert(:user)
      %{conversation: conv} = insert(:participant, user: user)
      msg = insert(:message, conversation: conv)

      {:ok, pinned} = Conversations.toggle_pin(msg.id, true, user)

      assert pinned.message_id == msg.id
      assert refetch(msg).pinned_at
      assert refetch(conv).pinned_messages == 1

      assert_receive {:event, %PubSub.PinnedMessageCreated{item: ^pinned}}
    end

    test "Participants can unpin messages" do
      user = insert(:user)
      %{conversation: conv} = insert(:participant, user: user)
      msg = insert(:message, conversation: conv, pinned_at: DateTime.utc_now())
      pin = insert(:pinned_message, message: msg, conversation: msg.conversation)

      {:ok, pinned} = Conversations.toggle_pin(msg.id, false, user)

      assert pinned.message_id == msg.id
      refute refetch(msg).pinned_at
      refute refetch(pin)

      assert_receive {:event, %PubSub.PinnedMessageDeleted{item: ^pinned}}
    end

    test "Nonparticipants cannot pin" do
      user = insert(:user)
      msg = insert(:message, conversation: build(:conversation, public: false))

      {:error, _} = Conversations.toggle_pin(msg.id, true, user)
    end
  end

  describe "#create_reaction/2" do
    test "Participants can create reactions to messages" do
      user = insert(:user)
      conversation = insert(:conversation)
      msg = insert(:message, conversation: conversation)
      insert(:participant, conversation: conversation, user: user)

      {:ok, updated} = Conversations.create_reaction(msg.id, "dog", user)
      %{reactions: [reaction]} = Core.Repo.preload(updated, [:reactions])

      assert reaction.name == "dog"
      assert reaction.user_id == user.id

      assert_receive {:event, %PubSub.MessageUpdated{item: ^updated}}
    end

    test "Nonparticipants cannot create reactions" do
      user = insert(:user)
      conversation = insert(:conversation, public: false)
      msg = insert(:message, conversation: conversation)

      {:error, _} = Conversations.create_reaction(msg.id, "dog", user)
    end
  end

  describe "#delete_reaction/2" do
    test "A user can delete his reactions" do
      reaction = insert(:message_reaction)

      {:ok, msg} = Conversations.delete_reaction(reaction.message_id, reaction.name, reaction.user)

      %{reactions: []} = Core.Repo.preload(msg, [:reactions])

      assert_receive {:event, %PubSub.MessageUpdated{item: ^msg}}
    end
  end

  describe "#bump_last_seen/2" do
    test "It will set the last_seen_at ts on the user's participant record" do
      participant = insert(:participant)

      {:ok, updated} = Conversations.bump_last_seen(participant.conversation.id, participant.user)

      assert updated.last_seen_at
    end

    test "It will create a participant if not present and set last_seen_at" do
      user         = insert(:user)
      conversation = insert(:conversation)

      {:ok, updated} = Conversations.bump_last_seen(conversation.id, user)

      assert updated.last_seen_at
    end

    test "it will mark notifications as viewed" do
      user         = insert(:user)
      conversation = insert(:conversation)
      notifs       = insert_list(2, :notification, user: user, message: insert(:message, conversation: conversation))

      {:ok, updated} = Conversations.bump_last_seen(conversation.id, user)

      assert updated.last_seen_at

      for notif <- notifs,
        do: assert refetch(notif).seen_at
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

  describe "#create_participants" do
    test "Participans can create multiple participants (by handle)" do
      user = insert(:user)
      other_users = insert_list(3, :user)
      %{conversation: conv} = insert(:participant, user: user)

      {:ok, participants} = Conversations.create_participants(Enum.map(other_users, & &1.handle), conv.id, user)

      assert Enum.all?(participants, & &1.conversation_id == conv.id)
      assert Enum.map(participants, & &1.user_id)
             |> ids_equal(other_users)
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

    test "Removing yourself from a chat is a soft delete" do
      chat = insert(:conversation, chat: true)
      %{user: user} = insert(:participant, conversation: chat)

      {:ok, deleted} = Conversations.delete_participant(chat.id, user.id, user)

      assert deleted.deleted_at
      assert refetch(deleted)
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

  describe "#create_dialog" do
    test "It will send an event" do
      msg = insert(:message)
      user = insert(:user)
      structured_msg = "<root><text>Hello World!</text></root>"

      {:ok, dialog} = Conversations.create_dialog(structured_msg, msg, user)

      assert_receive {:event, %PubSub.DialogCreated{item: ^dialog}}
    end
  end
end