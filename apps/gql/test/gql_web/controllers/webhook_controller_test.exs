defmodule GqlWeb.WebhookControllerTest do
  use GqlWeb.ConnCase
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

        %{"_type" => "root", "children" => [
          %{"_type" => "box", "children" => [
            %{"_type" => "link", "children" => [
              %{"attributes" => %{"url" => url}}
            ]}
          ]}
        ]} = result["structured_message"]

        assert url == gif_url
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

          %{"_type" => "root", "children" => [
            %{"_type" => "box", "children" => [
              %{"_type" => "link", "children" => [
                %{"attributes" => %{"url" => url}}
              ]}
            ]}
          ]} = result["structured_message"]

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

  defp mapify(msg), do: Jason.encode!(msg) |> Jason.decode!()
end