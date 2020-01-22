defmodule Core.Services.Platform.WebhooksTest do
  use Core.DataCase, async: true
  use Mimic
  alias Core.Services.Platform.Webhooks
  alias Core.PubSub

  @uuid Ecto.UUID.generate()
  @resp "{\"dialog\":\"<root>\\n  <box pad=\\\"small\\\">\\n    <link href=\\\"https://media.giphy.com/some.gif\\\" target=\\\"_blank\\\">\\n      <video url=\\\"https://media.giphy.com/some.gif\\\" autoPlay=\\\"true\\\" loop=\\\"true\\\" />\\n    </link>\\n  </box>\\n  <box direction=\\\"row\\\" gap=\\\"xsmall\\\">\\n    <button interaction=\\\"#{@uuid}\\\" payload=\\\"{&quot;shuffle&quot;:&quot;doggos&quot;}\\\" label=\\\"shuffle\\\" />\\n    <button interaction=\\\"#{@uuid}\\\" payload=\\\"{&quot;search&quot;:&quot;doggos&quot;,&quot;select&quot;:&quot;https://media.giphy.com/some.gif&quot;}\\\" label=\\\"select\\\" primary=\\\"true\\\" />\\n  </box>\\n</root>\\n\"}"

  describe "#send_hook" do
    test "It can send dialogs" do
      cmd = insert(:command, name: "giffy", webhook: build(:webhook, url: "https://my.giffy.com/webhook"))
      message = insert(:message, text: "/giffy doggos")
      expect(Mojito, :post, fn "https://my.giffy.com/webhook", _, _ ->
        {:ok, %Mojito.Response{body: @resp, status_code: 200}}
      end)

      {:ok, _} = Webhooks.send_hook(cmd, "", message)
      assert_receive {:event, %PubSub.DialogCreated{item: item}}

      assert item.anchor_message.id == message.id
      assert is_map(item.structured_message)
    end
  end
end