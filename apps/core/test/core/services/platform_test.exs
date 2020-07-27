defmodule Core.Services.PlatformTest do
  use Core.DataCase, async: true
  alias Core.Services.Platform
  alias Core.PubSub

  describe "#create_command" do
    test "users can create a new commands" do
      user = insert(:user)

      {:ok, command} = Platform.create_command(%{
        bot: %{},
        name: "giffy",
        webhook: %{url: "https://my.webhook.com"},
        unfurlers: [%{regex: ".*"}]
      }, user)

      preloaded = Core.Repo.preload(command, [:bot, :webhook])
      assert preloaded.name == "giffy"
      assert preloaded.creator_id == user.id

      assert preloaded.webhook.url == "https://my.webhook.com"
      assert preloaded.webhook.secret

      [unfurler] = preloaded.unfurlers

      assert unfurler.command_id == preloaded.id
      assert unfurler.regex == ".*"

      assert preloaded.bot.name == "giffy"
      assert preloaded.bot.handle == "giffy"
      assert preloaded.bot.bot

      assert_receive {:event, %PubSub.CommandCreated{item: ^command}}
    end

    test "Commands support associated incoming webhooks" do
      %{user: user, conversation: conv} = insert(:participant)

      {:ok, command} = Platform.create_command(%{
        bot: %{},
        name: "giffy",
        webhook: %{url: "https://my.webhook.com"},
        incoming_webhook: %{name: conv.name}
      }, user)

      preloaded = Core.Repo.preload(command, [:bot, :webhook, :incoming_webhook])
      assert preloaded.name == "giffy"
      assert preloaded.creator_id == user.id

      assert preloaded.webhook.url == "https://my.webhook.com"

      assert preloaded.bot.name == "giffy"
      assert preloaded.bot.handle == "giffy"
      assert preloaded.bot.bot

      assert preloaded.incoming_webhook.conversation_id == conv.id

      assert_receive {:event, %PubSub.CommandCreated{item: ^command}}
    end
  end

  describe "#dispatch_incoming_webhook/2" do
    test "It will create a message in the associated channel" do
      incoming_webhook = insert(:incoming_webhook)

      {:ok, msg} = Platform.dispatch_incoming_webhook(%{"text" => "A simple msg"}, incoming_webhook)

      assert msg.text == "A simple msg"
      assert msg.conversation_id == incoming_webhook.conversation_id
    end

    test "It will work with route keys" do
      incoming_webhook = insert(:incoming_webhook)
      webhook_route = insert(:webhook_route, incoming_webhook: incoming_webhook)

      {:ok, msg} = Platform.dispatch_incoming_webhook(
        %{"route_key" => webhook_route.route_key, "text" => "A simple msg"},
        incoming_webhook
      )

      assert msg.text == "A simple msg"
      assert msg.conversation_id == webhook_route.conversation_id
    end

    test "If the route key doesn't resolve, it'll fall back to the webhook default" do
      incoming_webhook = insert(:incoming_webhook)

      {:ok, msg} = Platform.dispatch_incoming_webhook(
        %{"route_key" => "not-found", "text" => "A simple msg"},
        incoming_webhook
      )

      assert msg.text == "A simple msg"
      assert msg.conversation_id == incoming_webhook.conversation_id
    end
  end

  describe "#update_command/2" do
    test "any user can update commands" do
      command = insert(:command)

      {:ok, updated} = Platform.update_command(command.name, %{documentation: "docs"}, insert(:user))

      assert updated.documentation == "docs"

      assert_receive {:event, %PubSub.CommandUpdated{item: ^updated}}
    end

    test "It can update the associated webhook of a command" do
       command = insert(:command)

       {:ok, _} = Platform.update_command(command.name, %{webhook: %{disabled: true}}, insert(:user))

       assert refetch(command.webhook).disabled
    end

    test "It can update the associated incoming webhook of a command" do
      command = insert(:command)
      insert(:incoming_webhook, command: command)

      {:ok, _} = Platform.update_command(command.name, %{incoming_webhook: %{routable: true}}, insert(:user))

      %{incoming_webhook: incoming} = Core.Repo.preload(command, [:incoming_webhook])

      assert incoming.routable
    end
  end

  describe "#dispatch_interaction/2" do
    test "It will send a InteractionDispatched event with the given payload" do
      %{id: id} = insert(:interaction)
      payload = "some payload"

      {:ok, _} = Platform.dispatch_interaction(payload, id)

      assert_receive {:event, %PubSub.InteractionDispatched{item: %{id: ^id, payload: ^payload}}}
    end
  end
end