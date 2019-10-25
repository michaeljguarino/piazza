defmodule GraphQl.MessagesQueryTest do
  use GraphQl.SchemaCase, async: true

  describe "pinnedMessages" do
    test "a participant can list pinned messages for a conversation" do
      user = insert(:user)
      conv = insert(:conversation, pinned_messages: 3)
      messages = insert_list(3, :pinned_message, conversation: conv) |> Enum.map(& &1.message)
      insert_list(3, :message, conversation: conv)
      insert(:participant, conversation: conv, user: user)

      {:ok, %{data: %{"conversation" => found}}} = run_q("""
          query Conversation($id: ID) {
            conversation(id: $id) {
              id
              pinnedMessageCount
              pinnedMessages(first: 5) {
                edges {
                  node {
                    message {
                      id
                      text
                      creator {
                        backgroundColor
                      }
                    }
                  }
                }
              }
            }
          }
      """, %{"id" => conv.id}, %{current_user: user})

      assert found["pinnedMessageCount"] == 3
      pinned = from_connection(found["pinnedMessages"])

      assert ids_equal(Enum.map(pinned, & &1["message"]), messages)
    end
  end

  describe "files" do
    test "a participant can list files for a conversation" do
      user = insert(:user)
      conv = insert(:conversation)
      files = for _ <- 1..3,
        do: insert(:file, message: build(:message, conversation: conv))

      {:ok, %{data: %{"conversation" => found}}} = run_q("""
          query Conversation($id: ID) {
            conversation(id: $id) {
              id
              fileCount
              files(first: 5) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
      """, %{"id" => conv.id}, %{current_user: user})

      assert found["fileCount"] == 3
      found_files = from_connection(found["files"])

      assert ids_equal(found_files, files)
    end
  end
end