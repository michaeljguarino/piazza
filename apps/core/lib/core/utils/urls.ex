defmodule Core.Utils.Url do
  @url_regex ~r/((https|http):\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/

  def find_urls(string) do
    Regex.scan(@url_regex, string, capture: :first)
    |> Enum.map(fn [result | _] -> result end)
  end
end