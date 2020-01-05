defmodule GqlWeb.IncomingWebhookControllerTest do
  use GqlWeb.ConnCase

  describe "#dispatch/2" do
    test "It will dispatch the given incoming webhook", %{conn: conn} do
      incoming_webhook = insert(:incoming_webhook)
      path = Routes.incoming_webhook_path(conn, :dispatch, incoming_webhook.secure_id)

      %{"id" => msg_id} =
        conn
        |> post(path, %{"text" => "A simple message"})
        |> json_response(200)

      msg = Core.Repo.get(Core.Models.Message, msg_id)
      assert msg.text == "A simple message"
    end
  end

  describe "#slack_dispatch/2" do
    test "It will dispatch the given incoming webhook", %{conn: conn} do
      incoming_webhook = insert(:incoming_webhook)
      path = Routes.incoming_webhook_path(conn, :slack_dispatch, incoming_webhook.secure_id)
      blocks = [
        %{type: "section", text: %{text: "Section 1"}},
        %{type: "section", text: %{text: "Section 2"}, accessory: %{type: "image", image_url: "url"}}
      ]

      %{"id" => msg_id} =
        conn
        |> post(path, %{text: "A simple message", blocks: blocks})
        |> json_response(200)

      msg = Core.Repo.get(Core.Models.Message, msg_id)
      assert msg.structured_message["children"]
    end
  end
end