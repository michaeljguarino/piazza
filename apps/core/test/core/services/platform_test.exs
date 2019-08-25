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
        webhook: %{url: "https://my.webhook.com"}
      }, user)

      preloaded = Core.Repo.preload(command, [:bot, :webhook])
      assert preloaded.name == "giffy"
      assert preloaded.creator_id == user.id

      assert preloaded.webhook.url == "https://my.webhook.com"

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
  end

  describe "#update_command/2" do
    test "any user can update commands" do
      command = insert(:command)

      {:ok, updated} = Platform.update_command(command.name, %{documentation: "docs"}, insert(:user))

      assert updated.documentation == "docs"

      assert_receive {:event, %PubSub.CommandUpdated{item: ^updated}}
    end
  end
end