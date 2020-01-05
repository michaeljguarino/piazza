defmodule Core.Services.Platform.Slack.Mkdwn do
  def to_markdown(string) do
    [
      {~r/<([^>]+)\|([^>]+)>/, &convert_link/3}
    ]
    |> Enum.reduce(string, fn {regex, replacement}, string ->
      Regex.replace(regex, string, replacement)
    end)
  end

  defp convert_link(_, link, name) do
    "[#{name}](#{link})"
  end
end