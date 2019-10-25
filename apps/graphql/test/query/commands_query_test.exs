defmodule GraphQl.CommandsQueryTest do
  use GraphQl.SchemaCase, async: true

  describe "Commands" do
    test "It will list available commands" do
      commands = insert_list(3, :command)
      expected = Enum.sort_by(commands, & &1.name) |> Enum.take(2)

      {:ok, %{data: %{"commands" => commands}}} = run_q("""
        query {
          commands(first: 2) {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      """, %{}, %{current_user: insert(:user)})

      commands = from_connection(commands)
      assert Enum.all?(commands, & &1["name"])
      assert ids_equal(commands, expected)
    end
  end

  describe "searchCommands" do
    test "It will search for commands by name" do
      commands = for i <- 1..3, do: insert(:command, name: "found-#{i}")
      ignore  = insert(:command)

      {:ok, %{data: %{"searchCommands" => found}}} = run_q("""
        query {
          searchCommands(name: "found", first: 4) {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      """, %{}, %{current_user: insert(:user)})

      found = from_connection(found) |> by_ids()

      for command <- commands, do: assert found[command.id]
      refute found[ignore.id]
    end
  end

  describe "#installableCommands" do
    test "It will list installable commands in the system" do
      [first | installables] = insert_list(3, :installable_command)
      insert(:command, name: first.name)

      {:ok, %{data: %{"installableCommands" => found}}} = run_q("""
        query {
          installableCommands(first: 5) {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      """, %{}, %{current_user: insert(:user)})

      found_installables = from_connection(found)
      assert ids_equal(installables, found_installables)
    end
  end
end