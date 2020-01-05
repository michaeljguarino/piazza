defmodule Core.Services.Platform.SlackMkdwnTest do
  use Core.DataCase, async: true
  alias Core.Services.Platform.Slack.Mkdwn

  describe "#to_markdown" do
    test "It can convert links" do
      linked = "<https://example.com|Example> <https://example.com|Other>"

      assert Mkdwn.to_markdown(linked) == "[Example](https://example.com) [Other](https://example.com)"
    end
  end
end