defmodule Core.Models.StructuredMessage.Type do
  use Ecto.Type

  def type, do: :map

  def cast(doc) when is_binary(doc) do
    case Core.Models.StructuredMessage.Xml.from_xml(doc) do
      {:ok, map} -> {:ok, map}
      _ -> :error
    end
  end
  def cast(map) when is_map(map), do: {:ok, map}
  def cast(_), do: :error

  def load(map) when is_map(map), do: {:ok, map}

  def dump(map) when is_map(map), do: {:ok, map}
end