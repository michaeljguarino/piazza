defmodule Core.Models.StructuredMessage do
  use Core.Models.StructuredMessage.Base

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
      attributes ~w(primary label href target interaction payload)
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
      attributes ~w(href target value)
      parents ~w(text box attachment)
    end
  end

  def to_string(msg) do
    flatten(msg)
    |> case do
      nil -> []
      flattened -> flattened
    end
    |> Enum.intersperse(" ")
    |> IO.iodata_to_binary()
  end

  def flatten(%{"value" => value}) when is_binary(value),
    do: [value]
  def flatten(%{"attributes" => %{"value" => value}}) when is_binary(value),
    do: [value]
  def flatten(%{"_type" => "button", "attributes" => %{"label" => label}}),
    do: [label]
  def flatten(%{"children" => children}) when is_list(children) do
    Enum.map(children, &flatten/1)
    |> Enum.filter(& &1)
    |> Enum.concat()
  end
  def flatten(_), do: nil
end