defmodule Core.Models.StructuredMessage do
  use Core.Models.StructuredMessage.Base

  defmodule Type do
    @behaviour Ecto.Type
    def type, do: :map

    def cast(doc) when is_binary(doc),
      do: Core.Models.StructuredMessage.from_xml(doc)
    def cast(map) when is_map(map), do: {:ok, map}
    def cast(_), do: :error

    def load(map) when is_map(map), do: {:ok, map}

    def dump(map) when is_map(map), do: {:ok, map}
  end

  def from_xml(doc) do
    with {:ok, parsed, _} <- :erlsom.simple_form(doc),
      do: {:ok, mapify(parsed)}
  end

  @leaf_nodes ['text', 'link', 'button', 'markdown', 'video', 'image']

  defp mapify({node, attributes, [value]}) when node in @leaf_nodes and is_list(value) do
    base_node(node, attributes)
    |> put_in(["attributes", "value"], to_string(value))
  end
  defp mapify({node, attributes, []}), do: base_node(node, attributes)
  defp mapify({node, attributes, children}) do
    base_node(node, attributes)
    |> Map.put("children", Enum.map(children, &mapify/1))
  end

  defp base_node(node, attributes) do
    %{
      "_type" => to_string(node),
      "attributes" => Enum.into(attributes, %{}, fn {k, v} -> {to_string(k), to_string(v)} end),
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