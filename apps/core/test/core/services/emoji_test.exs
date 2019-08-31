defmodule Core.Models.EmojiTest do
  use Core.DataCase, async: true
  alias Core.Services.Emoji, as: EmojiService
  @url "https://storage.googleapis.com/mguarino-piazza/uploads/avatars/6c269fbe-1aa7-4ae0-92ce-6c193aface1b/original.jpg?v=63732720702"

  describe "#create_emoji" do
    test "Users can create custom emoji" do
      user = insert(:user)
      {:ok, emoji} = EmojiService.create_emoji(%{name: "michael", image: @url}, user)

      assert emoji.name == "michael"
      assert emoji.image
      assert emoji.creator_id == user.id
    end
  end
end