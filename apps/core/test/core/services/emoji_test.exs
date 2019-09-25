defmodule Core.Models.EmojiTest do
  use Core.DataCase, async: true
  alias Core.Services.Emoji, as: EmojiService
  alias Core.PubSub
  @url "https://storage.googleapis.com/piazzaapp-assets/fb_profile.jpg"

  describe "#create_emoji" do
    test "Users can create custom emoji" do
      user = insert(:user)
      {:ok, emoji} = EmojiService.create_emoji(%{name: "michael", image: @url}, user)

      assert emoji.name == "michael"
      assert emoji.image
      assert emoji.creator_id == user.id

      assert_receive {:event, %PubSub.EmojiCreated{item: ^emoji}}
    end
  end
end