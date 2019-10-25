defmodule GraphQl.EmojiMutationTest do
  use GraphQl.SchemaCase, async: true
  @url "https://storage.googleapis.com/piazzaapp-assets/fb_profile.jpg"

  describe "createEmoji" do
    test "users can create new emoji" do
      {:ok, %{data: %{"createEmoji" => result}}} = run_q("""
        mutation CreateEmoji($attributes: EmojiAttributes!) {
          createEmoji(attributes: $attributes) {
            id
            name
            imageUrl
          }
        }
      """, %{"attributes" => %{"name" => "m", "image" => @url}}, %{current_user: insert(:user)})

      assert result["id"]
      assert result["name"] == "m"
      assert result["imageUrl"]
    end
  end
end