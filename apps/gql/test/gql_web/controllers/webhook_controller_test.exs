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

        assert result["message"] == "I found [doggos](#{gif_url})"
      end
    end

    test "It will return a 404 if not found", %{conn: conn} do
      with_mock Mojito, [
        get: fn "https://api.giphy.com/v1/search" <> _, _ ->
          {:ok, %Mojito.Response{body: "{}", status_code: 404}}
        end
      ] do
        path = Routes.webhook_path(conn, :giphy)

        conn
        |> post(path, %{message: "doggos"})
        |> json_response(404)
      end
    end
  end
end