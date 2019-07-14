defmodule Core.TestHelpers do
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
end