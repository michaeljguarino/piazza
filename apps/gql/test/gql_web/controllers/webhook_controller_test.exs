defmodule GqlWeb.WebhookControllerTest do
  use GqlWeb.ConnCase, async: true
  use Mimic
  alias Core.Models.StructuredMessage

  describe "#giphy/2" do
    test "It will return a gif if found", %{conn: conn} do
      gif_url = "https://media.giphy.com/some.gif"
      expect(Mojito, :get, fn "https://api.giphy.com/v1/gifs/search" <> _, _ ->
        json = Jason.encode!(%{data: [%{images: %{original: %{mp4: gif_url}}}]})
        {:ok, %Mojito.Response{body: json, status_code: 200}}
      end)

      path = Routes.webhook_path(conn, :giphy)

      result =
        conn
        |> post(path, %{"text" => "/giphy doggos"})
        |> json_response(200)

      {:ok, %{"_type" => "root", "children" => [
        %{"_type" => "box", "children" => [
          %{"_type" => "box", "children" => [
            %{"_type" => "link", "children" => [
              %{"_type" => "video", "attributes" => %{"url" => url}}
            ]}
          ]},
          %{"_type" => "box", "children" => [
            %{"_type" => "button", "attributes" => %{"label" => "shuffle", "payload" => shuffle}},
            %{"_type" => "button", "attributes" => %{"label" => "select", "payload" => select}}
          ]}
        ]}
      ]} = result} = StructuredMessage.Xml.from_xml(result["dialog"])

      assert StructuredMessage.validate(result) == :pass
      assert url == gif_url

      %{"shuffle" => "doggos"} = Jason.decode!(shuffle)
      %{"search" => "doggos", "select" => ^gif_url} = Jason.decode!(select)
    end
  end

  describe "#giphy_interaction/2" do
    test "It can reshuffle the gif", %{conn: conn} do
      gif_url = "https://media.giphy.com/some.gif"
      expect(Mojito, :get, fn "https://api.giphy.com/v1/gifs/search" <> _, _ ->
        json = Jason.encode!(%{data: [%{images: %{original: %{mp4: gif_url}}}]})
        {:ok, %Mojito.Response{body: json, status_code: 200}}
      end)

      path = Routes.webhook_path(conn, :giphy_interaction)

      result =
        conn
        |> post(path, %{"shuffle" => "doggos"})
        |> json_response(200)

      {:ok, %{"_type" => "root", "children" => [
        %{"_type" => "box", "children" => [
          %{"_type" => "box", "children" => [
            %{"_type" => "link", "children" => [
              %{"_type" => "video", "attributes" => %{"url" => url}}
            ]}
          ]},
          %{"_type" => "box", "children" => [
            %{"_type" => "button", "attributes" => %{"label" => "shuffle", "payload" => shuffle}},
            %{"_type" => "button", "attributes" => %{"label" => "select", "payload" => select}}
          ]}
        ]}
      ]} = result} = StructuredMessage.Xml.from_xml(result["dialog"])

      assert StructuredMessage.validate(result) == :pass
      assert url == gif_url

      %{"shuffle" => "doggos"} = Jason.decode!(shuffle)
      %{"search" => "doggos", "select" => ^gif_url} = Jason.decode!(select)
    end

    test "It creates a gif message on select", %{conn: conn} do
      gif_url = "https://media.giphy.com/some.gif"

      path = Routes.webhook_path(conn, :giphy_interaction)

      result =
        conn
        |> post(path, %{"select" => gif_url, "search" => "doggos", "width" => 100, "height" => 100})
        |> json_response(200)

      {:ok, %{"_type" => "root", "children" => [
        %{"_type" => "box", "children" => [
          %{"_type" => "link", "children" => [
            %{"_type" => "video", "attributes" => %{"url" => url}}
          ]}
        ]}
      ]} = result} = StructuredMessage.Xml.from_xml(result["structured_message"])

      assert StructuredMessage.validate(result) == :pass
      assert url == gif_url
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