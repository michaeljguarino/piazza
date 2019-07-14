defmodule Core.SchemaTest do
  use Core.DataCase

  describe "User" do
    test "It will fetch a user by id" do
      user = insert(:user)
      insert(:user)


      {:ok, %{data: %{"user" => found}}} = run_query("""
          query User($id: ID) {
            user(id: $id) {
              id
              name
            }
          }
      """, %{"id" => user.id})

      assert found["id"] == user.id
      assert found["name"] == user.name
    end
  end

  describe "Users" do
    test "It will list users in the system" do
      users = insert_list(3, :user)
      expected = Enum.sort_by(users, & &1.name) |> Enum.take(2)

      {:ok, %{data: %{"users" => found}}} = run_query("""
        query Users($userCount: Int!) {
          users(first: $userCount) {
            pageInfo {
              hasPreviousPage
              hasNextPage
            }
            edges {
              node {
                id
                name
              }
            }
          }
        }
      """, %{"userCount" => 2})

      refute found["pageInfo"]["hasPreviousPage"]
      assert found["pageInfo"]["hasNextPage"]

      assert Enum.all?(found["edges"], & &1["node"]["name"])
      assert ids_equal(Enum.map(found["edges"], & &1["node"]), expected)
    end
  end

  describe "Conversation" do
    test "It will fetch a conversation" do
      conversation = insert(:conversation)
      insert(:conversation)


      {:ok, %{data: %{"conversation" => found}}} = run_query("""
          query Conversation($id: ID) {
            conversation(id: $id) {
              id
              name
            }
          }
      """, %{"id" => conversation.id})

      assert found["id"] == conversation.id
      assert found["name"] == conversation.name
    end

    test "It will sideload messages and participants" do
      conversation = insert(:conversation)
      messages = insert_list(3, :message, conversation: conversation)
      participants = insert_list(2, :participant, conversation: conversation)
      ignored = insert(:conversation)
      insert_list(3, :message, conversation: ignored)
      insert_list(2, :participant, conversation: ignored)

      {:ok, %{data: %{"conversation" => found}}} = run_query("""
          query Conversation($participantCount: Int!, $messageCount: Int!, $id: ID) {
            conversation(id: $id) {
              id
              name
              messages(first: $messageCount) {
                edges {
                  node {
                    id
                    text
                  }
                }
              }
              participants(first: $participantCount) {
                edges {
                  node {
                    id
                    user {
                      id
                      name
                    }
                  }
                }
              }
            }
          }
      """, %{"id" => conversation.id, "participantCount" => 3, "messageCount" => 3})

      found_participants = from_connection(found["participants"])
      found_msgs = from_connection(found["messages"])

      assert found["id"] == conversation.id
      assert found["name"] == conversation.name
      assert ids_equal(found_msgs, messages)
      assert ids_equal(found_participants, participants)

      assert Enum.all?(found_participants, & &1["user"]["name"] && &1["user"]["id"])
    end
  end

  describe "Conversations" do
    test "It will list public conversations" do
      conversations = insert_list(3, :conversation)
      expected = Enum.sort_by(conversations, & &1.name) |> Enum.take(2)

      {:ok, %{data: %{"conversations" => found}}} = run_query("""
        query Conversations($public: Boolean!, $conversationCount: Int!) {
          conversations(public: $public, first: $conversationCount) {
            pageInfo {
              hasPreviousPage
              hasNextPage
            }
            edges {
              node {
                id
                name
              }
            }
          }
        }
      """, %{"conversationCount" => 2, "public" => true})

      refute found["pageInfo"]["hasPreviousPage"]
      assert found["pageInfo"]["hasNextPage"]
      users = from_connection(found)

      assert Enum.all?(users, & &1["name"])
      assert ids_equal(users, expected)
    end
  end

  def run_query(query, variables, context \\ %{}), do: Absinthe.run(query, Core.Schema, variables: variables, context: context)
end