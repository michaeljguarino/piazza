defmodule GqlWeb.WebhookControllerTest do
  use GqlWeb.ConnCase
  alias Core.Models.StructuredMessage
  import Mock

  describe "#giphy/2" do
    test "It will return a gif if found", %{conn: conn} do
      gif_url = "https://media.giphy.com/some.gif"
      with_mock Mojito, [
        get: fn "https://api.giphy.com/v1/gifs/search" <> _, _ ->
          json = Jason.encode!(%{data: [%{images: %{original: %{mp4: gif_url}}}]})
          {:ok, %Mojito.Response{body: json, status_code: 200}}
        end
      ] do
        path = Routes.webhook_path(conn, :giphy)

        result =
          conn
          |> post(path, %{"text" => "/giphy doggos"})
          |> json_response(200)

        {:ok, %{"_type" => "root", "children" => [
          %{"_type" => "box", "children" => [
            %{"_type" => "link", "children" => [
              %{"_type" => "video", "attributes" => %{"url" => url}}
            ]}
          ]}
        ]} = result} = StructuredMessage.Xml.from_xml(result["structured_message"])

        assert url == gif_url

        assert StructuredMessage.validate(result) == :pass
      end
    end

    test "It will return a random gif if misformatted", %{conn: conn} do
      gif_url = "https://media.giphy.com/some.gif"
      with_mock Mojito, [
        get: fn "https://api.giphy.com/v1/gifs/search" <> _, _ ->
          json = Jason.encode!(%{data: [%{images: %{original: %{mp4: gif_url}}}]})
          {:ok, %Mojito.Response{body: json, status_code: 200}}
        end
      ] do
        path = Routes.webhook_path(conn, :giphy)

        result =
          conn
          |> post(path, %{message: "doggos"})
          |> json_response(200)

          {:ok, %{"_type" => "root", "children" => [
            %{"_type" => "box", "children" => [
              %{"_type" => "link", "children" => [
                %{"_type" => "video", "attributes" => %{"url" => url}}
              ]}
            ]}
          ]}} = StructuredMessage.Xml.from_xml(result["structured_message"])

          assert url == gif_url
      end
    end
  end

  describe "piazza/2" do
    test "It will trigger the piazza command", %{conn: conn} do
      insert(:user, handle: "piazza", roles: %{admin: true})
      user         = insert(:user)
      conversation = insert(:conversation)
      msg          = insert(:message, text: "/piazza invite @#{user.handle}", conversation: conversation)

      path = Routes.webhook_path(conn, :piazza)

      %{"message" => message} =
        conn
        |> post(path, mapify(msg))
        |> json_response(200)

      assert message == "Added @#{user.handle} to the conversation"
    end
  end

  describe "#github/2" do
    test "It will 200", %{conn: conn} do
      path   = Routes.webhook_path(conn, :github)
      secret = Gql.Plug.WebhookValidators.secret(:github)
      raw_body = Jason.encode!(%{
        head_commit: %{message: "a message", author: %{name: "m"}, url: "github.com"},
        repository: %{full_name: "piazza", html_url: "https://github.com/piazza"},
        sender: %{avatar_url: "https://avatar.com", login: "michaelguarino"},
        ref: "refs/heads/master",
        after: "aedcf23142143"
      })

      signature = "sha1=#{:crypto.hmac(:sha, secret, raw_body) |> Base.encode16(case: :lower)}"
      with_mock Mojito, [
        post: fn "https://dummy.webhook", _, _ -> {:ok, %Mojito.Response{}} end
      ] do
        %{"text" => _, "structured_message" => structured_msg} =
          conn
          |> put_req_header("x-hub-signature", signature)
          |> put_req_header("content-type", "application/json")
          |> post(path, raw_body)
          |> json_response(200)

        {:ok, _} = StructuredMessage.Xml.from_xml(structured_msg)
      end
    end
  end

  defp mapify(msg), do: Jason.encode!(msg) |> Jason.decode!()
end