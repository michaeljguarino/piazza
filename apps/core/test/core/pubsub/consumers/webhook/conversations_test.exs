defmodule Core.PubSub.Consumers.Webhook.ConversationsTest do
  use Core.DataCase
  import Mock
  alias Core.PubSub
  alias Core.PubSub.Consumers.Webhook

  describe "MessageCreated" do
    test "It will dispatch commands when present" do
      cmd = insert(:command, name: "giffy", webhook: build(:webhook, url: "https://my.giffy.com/webhook"))
      message = insert(:message, text: "/giffy doggos")
      with_mock Mojito, [
        post: fn "https://my.giffy.com/webhook", _, _ ->
          {:ok, %Mojito.Response{body: Jason.encode!(%{text: "here's a gif"}), status_code: 200}}
        end
      ] do

        with_mailbox fn ->
          event = %PubSub.MessageCreated{item: message}
          Webhook.handle_event(event)

          conversation_id = message.conversation_id
          assert_receive {:event, %PubSub.MessageCreated{item: %{conversation_id: ^conversation_id} = response_message}}

          assert response_message.conversation_id == message.conversation_id
          assert response_message.creator_id == cmd.bot_id
          assert response_message.text == "here's a gif"
        end
      end
    end

    test "It will configure webhook route tables if requested" do
      cmd = insert(:command, name: "giffy", webhook: build(:webhook, url: "https://my.giffy.com/webhook"))
      incoming = insert(:incoming_webhook, command: cmd)
      message = insert(:message, text: "/giffy doggos")
      with_mock Mojito, [
        post: fn "https://my.giffy.com/webhook", _, _ ->
          {:ok, %Mojito.Response{body: Jason.encode!(%{subscribe: "doggos"}), status_code: 200}}
        end
      ] do

        with_mailbox fn ->
          event = %PubSub.MessageCreated{item: message}
          Webhook.handle_event(event)

          conversation_id = message.conversation_id
          assert_receive {:event, %PubSub.MessageCreated{item: %{conversation_id: ^conversation_id} = response_message}}

          assert response_message.conversation_id == message.conversation_id
          assert response_message.creator_id == cmd.bot_id
          assert response_message.text == "Subscribed this conversation to doggos"

          assert Core.Repo.get_by(Core.Models.WebhookRoute, incoming_webhook_id: incoming.id, route_key: "doggos")
        end
      end
    end

    test "It will ignore if no command exists" do
      message = insert(:message, text: "/nocommand help")
      event = %PubSub.MessageCreated{item: message}
      :ok = Webhook.handle_event(event)
    end

    test "It will ignore if the actor was a bot" do
      bot = insert(:user, bot: true)
      insert(:command, name: "command")
      message = insert(:message, text: "/command response", creator: bot)
      event = %PubSub.MessageCreated{item: message, actor: bot}
      :ok = Webhook.handle_event(event)
    end

    test "It will ignore when there is no command" do
      message = insert(:message, text: "not a command")
      event = %PubSub.MessageCreated{item: message}
      :ok = Webhook.handle_event(event)
    end
  end

  describe "InteractionDispatched" do
    test "It will send a specified payload to the interaction endpoint of a command's webhook" do
      cmd = insert(:command, name: "giffy", webhook: build(:webhook, url: "https://my.giffy.com/webhook"))
      msg = insert(:message)
      interaction = insert(:interaction, command: cmd, message: msg)
      payload = Jason.encode!(%{some: :payload})
      with_mock Mojito, [
        post: fn "https://my.giffy.com/webhook/interaction", _, ^payload ->
          {:ok, %Mojito.Response{body: Jason.encode!(%{text: "here's a gif"}), status_code: 200}}
        end
      ] do
        with_mailbox fn ->
          event = %PubSub.InteractionDispatched{item: %{interaction | payload: payload}}
          Webhook.handle_event(event)

          conversation_id = msg.conversation_id
          assert_receive {:event, %PubSub.MessageCreated{item: %{conversation_id: ^conversation_id} = response_message}}

          assert response_message.conversation_id == msg.conversation_id
          assert response_message.creator_id == cmd.bot_id
          assert response_message.text == "here's a gif"
        end
      end
    end
  end
end