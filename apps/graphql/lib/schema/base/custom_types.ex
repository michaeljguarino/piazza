defmodule GraphQl.Schema.CustomTypes do
  use Absinthe.Schema.Notation

  scalar :map, name: "Map" do
    serialize &mapish/1
    parse &mapish/1
  end

  enum :delta do
    value :create
    value :update
    value :delete
  end

  enum :direction do
    value :before
    value :after
  end

  defp mapish(m) when is_map(m), do: m
  defp mapish(_), do: :error
end
