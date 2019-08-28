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

      %{"text" => message} =
        conn
        |> post(path, mapify(msg))
        |> json_response(200)

      assert message == "Added @#{user.handle} to the conversation"
    end
  end

  describe "github/2" do
    test "It will return a subscribe response", %{conn: conn} do
      msg = insert(:message, text: "/github subscribe michaeljguarino/piazza")

      path = Routes.webhook_path(conn, :github)

      %{"subscribe" => "michaeljguarino/piazza"} =
        conn
        |> post(path, mapify(msg))
        |> json_response(200)
    end
  end

  defp mapify(msg), do: Jason.encode!(msg) |> Jason.decode!()
end