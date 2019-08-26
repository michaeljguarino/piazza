defmodule Core.Models.StructuredMessage do
  use Core.Models.StructuredMessage.Base
  import SweetXml

  defmodule Type do
    @behaviour Ecto.Type
    def type, do: :map

    def cast(doc) when is_binary(doc) do
      case Core.Models.StructuredMessage.from_xml(doc) do
        {:ok, map} -> {:ok, map}
        _ -> :error
      end
    end
    def cast(map) when is_map(map), do: {:ok, map}
    def cast(_), do: :error

    def load(map) when is_map(map), do: {:ok, map}

    def dump(map) when is_map(map), do: {:ok, map}
  end

  def from_xml(doc) do
    try do
      {:ok, parse(doc) |> mapify()}
    catch
      :exit, _value -> :error
    end
  end

  defp mapify(xmlElement(name: name, attributes: attributes, content: [])),
    do: base_node(name, attributes)
  defp mapify(xmlElement(name: name, attributes: attributes, content: [xmlText(value: value)])) do
    base_node(name, attributes)
    |> put_in(["attributes", "value"], to_string(value))
  end
  defp mapify(xmlElement(name: name, attributes: attributes, content: children)) do
    base_node(name, attributes)
    |> Map.put("children", Enum.map(children, &mapify/1) |> Enum.filter(& &1))
  end
  defp mapify(_), do: nil

  defp base_node(node, attributes) do
    %{
      "_type" => to_string(node),
      "attributes" => Enum.into(attributes, %{}, fn
        xmlAttribute(name: name, value: value) -> {to_string(name), to_string(value)}
      end),
    }
  end

  schema do
    component "box" do
      attributes ~w(direction width height pad margin align justify gap)
      parents ~w(root box attachment)
    end

    component "attachment" do
      attributes ~w(accent height width pad margin align justify gap)
      parents ~w(root)
    end

    component "text" do
      attributes ~w(size weight value color)
      parents ~w(box text attachment root link)
    end

    component "markdown" do
      attributes ~w(size weight value)
      parents ~w(box text attachment root)
    end

    component "button" do
      attributes ~w(primary label href target)
      parents ~w(box)
    end

    component "input" do
      attributes ~w(placeholder name)
      parents ~w(box)
    end

    component "image" do
      attributes ~w(width height url)
      parents ~w(box link)
    end

    component "video" do
      attributes ~w(width height url autoPlay loop)
      parents ~w(box link attachment)
    end

    component "link" do
      attributes ~w(href target)
      parents ~w(text box attachment)
    end
  end
end