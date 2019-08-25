defmodule GqlWeb.IncomingWebhookControllerTest do
  use GqlWeb.ConnCase

  describe "#handle/2" do
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
end