defmodule Core.Utils.Url do
  @url_regex ~r/((https|http):\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/

  def find_urls(string) do
    Regex.scan(@url_regex, string, capture: :first)
    |> Enum.map(fn [result | _] -> result end)
  end

  def unfurl(url, opts \\ []) do
    with {:ok, {body, status_code}} <- fetch(url, opts),
         {:ok, results}             <- parse(body)
    do
      {:ok, %Furlex{
        canonical_url: Furlex.Parser.extract_canonical(body),
        facebook: results.facebook,
        twitter: results.twitter,
        json_ld: results.json_ld,
        other: results.other,
        status_code: status_code,
      }}
    end
  end

  defp fetch(url, opts) do
    fetch        = Task.async Furlex.Fetcher, :fetch,        [ url, opts ]
    yield        = Task.yield_many [ fetch ]

    with [ fetch ]                                 <- yield,
         {_fetch, {:ok, {:ok, body, status_code}}} <- fetch
    do
      {:ok, {body, status_code}}
    else
      _ -> {:error, :fetch_error}
    end
  end

  defp parse(body) do
    parse = &Task.async(&1, :parse, [ body ])
    tasks = Enum.map([
      Furlex.Parser.Facebook,
      Furlex.Parser.Twitter,
      Furlex.Parser.JsonLD,
      Furlex.Parser.HTML
    ], parse)

    with [ facebook, twitter, json_ld, other ] <- Task.yield_many(tasks),
         {_facebook, {:ok, {:ok, facebook}}}   <- facebook,
         {_twitter,  {:ok, {:ok, twitter}}}    <- twitter,
         {_json_ld,  {:ok, {:ok, json_ld}}}    <- json_ld,
         {_other,    {:ok, {:ok, other}}}      <- other
    do
      {:ok, %{
        facebook: facebook,
        twitter: twitter,
        json_ld: json_ld,
        other: other
      }}
    else
      _ -> {:error, :parse_error}
    end
  end
end