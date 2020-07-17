defmodule GraphQl.PlatformMutationsTest do
  use GraphQl.SchemaCase, async: true

  describe "createCommand" do
    test "A user can create a new command" do
      user = insert(:user)

      {:ok, %{data: %{"createCommand" => command}}} = run_q("""
        mutation {
          createCommand(attributes: {
            name: "giphy",
            documentation: "Sends you gifs",
            webhook: {url: "https://api.giphy.com"},
            unfurlers: [{regex: ".*"}]
          }) {
            name
            documentation
            webhook {
              url
            }
            creator {
              name
            }
            bot {
              email
            }
            unfurlers {
              regex
            }
          }
        }
      """, %{}, %{current_user: user})

      assert command["name"] == "giphy"
      assert command["documentation"] == "Sends you gifs"
      assert command["webhook"]["url"] == "https://api.giphy.com"
      assert command["creator"]["name"]
      assert command["bot"]["email"]
      [%{"regex" => ".*"}] = command["unfurlers"]
    end

    test "A user can create a command with incoming webhooks" do
      %{user: user, conversation: conv} = insert(:participant)

      {:ok, %{data: %{"createCommand" => command}}} = run_q("""
        mutation CreateCommand($incomingWebhook: IncomingWebhookAttributes) {
          createCommand(attributes: {
            name: "giphy",
            documentation: "Sends you gifs",
            webhook: {url: "https://api.giphy.com"},
            incomingWebhook: $incomingWebhook
          }) {
            name
            documentation
            incomingWebhook {
              url
              conversation {
                name
              }
            }
          }
        }
      """, %{"incomingWebhook" => %{"name" => conv.name}}, %{current_user: user})

      "https://localhost/external/incoming_webhooks/" <> secure_id = command["incomingWebhook"]["url"]
      assert Core.Services.Platform.get_incoming_webhook(secure_id)
      assert command["incomingWebhook"]["conversation"]["name"] == conv.name
    end
  end

  describe "updateCommand" do
    test "A user can create a new command" do
      user    = insert(:user)
      command = insert(:command, name: "giphy")

      {:ok, %{data: %{"updateCommand" => result}}} = run_q("""
        mutation {
          updateCommand(name: "giphy", attributes: {
            documentation: "Sends you gifs"
          }) {
            id
            name
            documentation
          }
        }
      """, %{}, %{current_user: user})

      assert result["id"] == command.id
      assert result["name"] == "giphy"
      assert result["documentation"] == "Sends you gifs"
    end
  end

  describe "dispatchInteraction" do
    test "It will dispatch and return an interaction" do
      user = insert(:user)
      interaction = insert(:interaction)

      {:ok, %{data: %{"dispatchInteraction" => result}}} = run_q("""
        mutation DispatchInteraction($id: ID!, $payload: String!) {
          dispatchInteraction(id: $id, payload: $payload) {
            id
            command {
              id
            }
            message {
              id
            }
          }
        }
      """, %{"id" => interaction.id, "payload" => "some payload"}, %{current_user: user})

      assert result["id"] == interaction.id
      assert result["command"]["id"] == interaction.command.id
      assert result["message"]["id"] == interaction.message.id
    end
  end
end