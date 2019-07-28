defmodule Core.PubSub.Consumers.Recurse.ConversationsTest do
  use Core.DataCase
  import Mock
  alias Core.PubSub
  alias PubSub.Consumers.Recurse
  alias Core.Services.Conversations


  describe "ConversationCreated" do
    test "It will add all users the conversation if it was global" do
      conv = insert(:conversation, global: true)
      users = insert_list(3, :user)

      event = %PubSub.ConversationCreated{item: conv}
      3 = Recurse.handle_event(event)

      for %{id: user_id} <- users,
        do: assert Conversations.get_participant(user_id, conv.id)
    end

    test "It will ignore if the conversation is not global" do
      conv = insert(:conversation)
      insert_list(3, :user)

      event = %PubSub.ConversationCreated{item: conv}
      :ok = Recurse.handle_event(event)
    end
  end

  describe "MessageCreated" do
    test "It will dispatch commands when present" do
      cmd = insert(:command, name: "giffy", webhook: build(:webhook, url: "https://my.giffy.com/webhook"))
      message = insert(:message, text: "/giffy doggos")
      with_mock Mojito, [
        post: fn "https://my.giffy.com/webhook", _, _ ->
          {:ok, %Mojito.Response{body: Jason.encode!(%{message: "here's a gif"}), status_code: 200}}
        end
      ] do

        with_mailbox fn ->
          event = %PubSub.MessageCreated{item: message}
          Recurse.handle_event(event)

          conversation_id = message.conversation_id
          assert_receive {:event, %PubSub.MessageCreated{item: %{conversation_id: ^conversation_id} = response_message}}

          assert response_message.conversation_id == message.conversation_id
          assert response_message.creator_id == cmd.bot_id
          assert response_message.text == "here's a gif"
        end
      end
    end

    test "It will ignore if no command exists" do
      message = insert(:message, text: "/nocommand help")
      event = %PubSub.MessageCreated{item: message}
      :ok = Recurse.handle_event(event)
    end

    test "It will ignore if the actor was a bot" do
      bot = insert(:user, bot: true)
      insert(:command, name: "command")
      message = insert(:message, text: "/command response", creator: bot)
      event = %PubSub.MessageCreated{item: message, actor: bot}
      :ok = Recurse.handle_event(event)
    end

    test "It will ignore when there is no command" do
      message = insert(:message, text: "not a command")
      event = %PubSub.MessageCreated{item: message}
      :ok = Recurse.handle_event(event)
    end

    test "It will auto-unfurl urls" do
      message = insert(:message, text: "I found [doggo](https://giphy.com/embed/Y4pAQv58ETJgRwoLxj)")
      event = %PubSub.MessageCreated{item: message, actor: message.creator}
      {:ok, new_message} = Recurse.handle_event(event)

      assert new_message.embed.type == :video
      assert new_message.embed.url
    end

    test "It will ignore previous embeds" do
      message = insert(:message, embed: %{title: "something"}, text: "I found [doggo](https://giphy.com/embed/Y4pAQv58ETJgRwoLxj)")
      event = %PubSub.MessageCreated{item: message, actor: message.creator}
      :ok = Recurse.handle_event(event)
    end
  end
end