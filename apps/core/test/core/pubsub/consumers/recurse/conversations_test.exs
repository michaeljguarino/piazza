defmodule Core.PubSub.Consumers.Recurse.ConversationsTest do
  use Core.DataCase
  use Mimic
  alias Core.PubSub
  alias PubSub.Consumers.Recurse
  alias Core.Services.Conversations

  setup :set_mimic_global

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
    test "It will auto-unfurl urls" do
      message = insert(:message, text: "I found [doggo](https://giphy.com/embed/Y4pAQv58ETJgRwoLxj)")
      event = %PubSub.MessageCreated{item: message, actor: message.creator}
      {:ok, new_message} = Recurse.handle_event(event)

      assert new_message.embed.type == :image
      assert new_message.embed.url
      assert new_message.embed.description
      assert new_message.embed.title
    end

    test "It will process custom unfurlers" do
      Core.Cache.Replicated.delete(:unfurlers)
      cmd = insert(:command, name: "giffy", webhook: build(:webhook, url: "https://my.giffy.com/webhook"))
      insert(:unfurler, command: cmd, regex: "<gif:\\w+>")
      message = insert(:message, text: "doggos <gif:some_gif>")
      expect(Mojito, :post, fn "https://my.giffy.com/webhook/unfurl", _, payload ->
        %{"matches" => [match]} = Jason.decode!(payload)
        {:ok, %Mojito.Response{body: Jason.encode!(%{text: "here's a #{match}"}), status_code: 200}}
      end)

      with_mailbox fn ->
        event = %PubSub.MessageCreated{item: message, actor: message.creator}
        Recurse.handle_event(event)

        assert_receive {:event, %PubSub.MessageCreated{item: response_message}}

        assert response_message.conversation_id == message.conversation_id
        assert response_message.creator_id == message.creator_id
        assert response_message.text == "here's a <gif:some_gif>"
      end

      Core.Cache.Replicated.delete(:unfurlers)
    end

    test "It will handle non-html content" do
      url = "https://media1.giphy.com/media/Y4pAQv58ETJgRwoLxj/giphy.gif?cid=790b76115d3df1ac77494f414156f84b&rid=giphy.gif"
      msg = insert(:message, text: url)
      event = %PubSub.MessageCreated{item: msg, actor: msg.creator}
      {:ok, new_msg} = Recurse.handle_event(event)

      assert new_msg.embed.type == :image
      assert new_msg.embed.url  == url
    end

    test "It will ignore previous embeds" do
      message = insert(:message, embed: %{url: "something"}, text: "I found [doggo](https://giphy.com/embed/Y4pAQv58ETJgRwoLxj)")
      event = %PubSub.MessageCreated{item: message, actor: message.creator}
      :ok = Recurse.handle_event(event)
    end

    test "It can handle github links" do
      message = insert(:message, text: "https://github.com/kubernetes/kubernetes")
      event = %PubSub.MessageCreated{item: message, actor: message.creator}
      {:ok, new_msg} = Recurse.handle_event(event)

      assert new_msg.embed.type == :image
      assert new_msg.embed.image_url
      assert new_msg.embed.title
      assert new_msg.embed.description
    end

    test "it can extract publisher info" do
      message = insert(:message, text: "https://nypost.com/2020/02/26/cdc-warns-men-about-facial-hair-dangers-as-coronavirus-spreads/")
      event = %PubSub.MessageCreated{item: message, actor: message.creator}
      {:ok, new_msg} = Recurse.handle_event(event)

      assert new_msg.embed.publisher
      assert new_msg.embed.logo
    end

    test "It can properly handle youtube" do
      message = insert(:message, text: "https://www.youtube.com/watch?v=fu6IOHZ3cfg")
      event = %PubSub.MessageCreated{item: message, actor: message.creator}
      {:ok, new_msg} = Recurse.handle_event(event)

      assert new_msg.embed.video_url
      assert new_msg.embed.video_type == :embed
    end

    @tag :skip
    test "it can handle bloomberg urls" do
      message = insert(:message, text: "https://www.bloomberg.com/news/articles/2020-05-26/u-s-weighs-sanctions-on-chinese-officials-firms-over-hong-kong-kaobpsbv?srnd=premium")
      event = %PubSub.MessageCreated{item: message, actor: message.creator}
      {:ok, new_msg} = Recurse.handle_event(event)

      assert new_msg.embed.publisher
      assert new_msg.embed.logo
    end

    test "it can handle exotic urls" do
      message = insert(:message, text: "https://www.dezeen.com/2020/05/22/christophe-gernigon-plex-eat-coronavirus-face-shield-dining-design/")
      event = %PubSub.MessageCreated{item: message, actor: message.creator}
      {:ok, new_msg} = Recurse.handle_event(event)

      assert new_msg.embed.type == :image
    end

    test "It can handle a redirect url" do
      message = insert(:message, text: "https://www.zerohedge.com/energy/california-forced-rolling-blackouts-heatwave-sparks-energy-shortfall")
      event = %PubSub.MessageCreated{item: message, actor: message.creator}
      {:ok, new_msg} = Recurse.handle_event(event)

      assert new_msg.embed.type == :image
    end

    test "it can handle this url" do
      message = insert(:message, text: "https://material.io/design/foundation-overview")

      event = %PubSub.MessageCreated{item: message, actor: message.creator}
      {:ok, new_msg} = Recurse.handle_event(event)

      assert new_msg.embed.type == :image
    end

    test "it can handle wikipedia" do
      message = insert(:message, text: "https://en.wikipedia.org/wiki/Mission_District,_San_Francisco")

      event = %PubSub.MessageCreated{item: message, actor: message.creator}
      {:ok, new_msg} = Recurse.handle_event(event)

      assert new_msg.embed.type == :image
      assert new_msg.embed.title
      assert new_msg.embed.description
    end
  end
end