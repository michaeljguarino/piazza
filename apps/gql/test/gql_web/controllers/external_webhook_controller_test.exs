defmodule GqlWeb.ExternalWebhookControllerTest do
  use GqlWeb.ConnCase, async: true
  alias Core.Models.StructuredMessage
  use Mimic

  describe "#github/2" do
    test "It will 200", %{conn: conn} do
      path   = Routes.external_webhook_path(conn, :github)
      secret = Gql.Plug.WebhookValidators.secret(:github)
      raw_body = Jason.encode!(%{
        head_commit: %{message: "a message", author: %{name: "m"}, url: "github.com"},
        repository: %{full_name: "piazza", html_url: "https://github.com/piazza"},
        sender: %{avatar_url: "https://avatar.com", login: "michaelguarino"},
        ref: "refs/heads/master",
        after: "aedcf23142143"
      })

      signature = "sha1=#{:crypto.hmac(:sha, secret, raw_body) |> Base.encode16(case: :lower)}"
      expect(Mojito, :post, fn "https://dummy.webhook", _, _ -> {:ok, %Mojito.Response{}} end)

      %{"text" => _, "structured_message" => structured_msg, "route_key" => route_key} =
        conn
        |> put_req_header("x-hub-signature", signature)
        |> put_req_header("content-type", "application/json")
        |> post(path, raw_body)
        |> json_response(200)

      assert route_key == "piazza"
      {:ok, _} = StructuredMessage.Xml.from_xml(structured_msg)
    end
  end
end