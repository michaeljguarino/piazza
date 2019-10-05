defmodule Core.PubSub.Consumers.Recurse.ConversationsTest do
  use Core.DataCase
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
    test "It will auto-unfurl urls" do
      message = insert(:message, text: "I found [doggo](https://giphy.com/embed/Y4pAQv58ETJgRwoLxj)")
      event = %PubSub.MessageCreated{item: message, actor: message.creator}
      {:ok, new_message} = Recurse.handle_event(event)

      assert new_message.embed.type == :image
      assert new_message.embed.url
      assert new_message.embed.description
      assert new_message.embed.title
      assert new_message.embed.author
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

      assert new_msg.embed.type == :site
      assert new_msg.embed.image_url
      assert new_msg.embed.title
      assert new_msg.embed.description
    end
  end
end