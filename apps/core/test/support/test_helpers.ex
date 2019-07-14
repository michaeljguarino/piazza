defmodule Core.TestHelpers do
  import ExUnit.Assertions
  alias Core.Models.User

  def ids_equal(found, expected) do
    found = MapSet.new(ids(found))
    expected = MapSet.new(ids(expected))

    MapSet.equal?(found, expected)
  end

  def ids(list) do
    Enum.map(list, fn
      %{id: id} -> id
      %{"id" => id} -> id
      id when is_binary(id) -> id
    end)
  end

  def from_connection(%{"edges" => edges}), do: Enum.map(edges, & &1["node"])

  def run_query(query, variables, context \\ %{}),
    do: Absinthe.run(query, Core.Schema, variables: variables, context: context)

  def verify_record(schema, %{"id" => id} = result) do
    user = Core.Repo.get(schema, id)
    assert user

    Enum.each(result, fn {key, val} ->
      assert Map.get(user, String.to_atom(key)) == val
    end)
  end

  def with_password(%User{} = user, pwd) do
    user
    |> User.changeset(%{password: pwd})
    |> Core.Repo.insert!()
  end

  def submap?(sub, sup) do
    Enum.all?(sub, fn {k, v} -> Map.get(sup, k) == v end)
  end
end