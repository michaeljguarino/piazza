defmodule Mix.Tasks.Dump.Commands do
  use Mix.Task
  import Core.Commands.Base, only: [command_record: 4]
  alias Core.Commands.Github

  @shortdoc "Prints yml encodings of all the commands supported by piazza natively"
  def run(_) do
    Mix.Task.run("compile")

    [
      command_record(
        Github,
        "Notifies you of things going on in your repos",
        "http://piazza-gql:4000/webhooks/github",
        "https://storage.googleapis.com/piazzaapp-assets/github.png"
      )
    ]
    |> Enum.map(fn
      %{name: name, avatar: avatar, description: desc, documentation: doc, webhook: webhook} ->
      %{
        name: name,
        icon: avatar,
        description: desc,
        spec: %{
          description: desc,
          documentation: doc,
          webhook: webhook
        }
      }
    end)
    |> Enum.map(&as_yaml/1)
    |> Enum.map(&IO.puts/1)
  end

  def as_yaml(map, indentation \\ 0)
  def as_yaml(map, indentation) when is_map(map) do
    (if indentation > 0, do: "\n", else: "") <> (
    Enum.map(map, fn {k, v} ->
      "#{String.duplicate(" ", indentation)}#{k}: #{as_yaml(v, indentation + 2)}"
    end)
    |> Enum.join("\n"))
  end
  def as_yaml(bin, indentation) when is_binary(bin) do
    case String.contains?(bin, "\n") do
      true -> "|\n#{String.duplicate(" ", indentation)}#{bin}"
      false -> "\"#{bin}\""
    end
  end
  def as_yaml(scalar, _) when is_integer(scalar) or is_float(scalar) or is_binary(scalar) or is_atom(scalar),
    do: scalar
end