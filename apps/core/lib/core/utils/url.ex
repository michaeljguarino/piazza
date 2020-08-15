defmodule Core.Utils.Url do
  require Logger
  alias Furlex.Oembed
  @url_regex ~r/((https|http):\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/

  def find_urls(string) do
    Regex.scan(@url_regex, string, capture: :first)
    |> Enum.map(fn [result | _] -> result end)
  end

  def unfurl(url, opts \\ []) do
    with {:ok, {body, headers, status_code}, oembed} <- fetch(url, opts),
         {:ok, results} <- parse(body, normalize(headers)) do
      {:ok, %Furlex{
        canonical_url: url,
        oembed: oembed,
        facebook: results.facebook,
        twitter: results.twitter,
        json_ld: results.json_ld,
        other: results.other,
        status_code: status_code,
      }}
    else
      :plain -> {:ok, {:plain, url}}
      {:ok, _, oembed} when not is_nil(oembed) -> {:ok, %Furlex{oembed: oembed}}
      _ -> {:error, :parse_error}
    end
  end

  defp fetch(url, opts) do
    fetch        = Task.async(fn -> intelligent_fetch(url, opts) end)
    # fetch_oembed = Task.async(fn -> fetch_oembed(url, opts) end)

    with [fetch] <- Task.yield_many([fetch], 30_000),
         {_fetch, {:ok, {:ok, body, headers, status_code}}} <- fetch do
      {:ok, {body, headers, status_code}, nil}
    else
      _ -> {:error, :fetch_error}
    end
  end

  defp intelligent_fetch(url, opts) do
    with {:ok, %{headers: headers, status_code: code}} <- HTTPoison.head(url, [], opts),
         :stop <- proceed(code, normalize(headers)) do
      {:ok, "", headers, code}
    else
      :continue -> do_fetch(url, opts)
      error -> error
    end
  end

  defp do_fetch(url, opts) do
    case HTTPoison.get(url, [], opts) do
      {:ok, %{body: body, headers: headers, status_code: status_code}} -> {:ok, body, headers, status_code}
      other -> other
    end
  end

  def fetch_oembed(url, opts \\ []) do
    with {:ok, endpoint} <- Oembed.endpoint_from_url(url),
         params           = %{"url" => url},
         opts             = Keyword.put(opts, :params, params),
         {:ok, {body, _, _}} <- do_fetch(endpoint, opts),
         {:ok, body}     <- Jason.decode(body)
    do
      {:ok, body}
    else
      {:error, :no_oembed_provider} ->
        {:ok, nil}

      other ->
        "Could not fetch oembed for #{inspect url}: #{inspect other}"
        |> Logger.error()

        {:ok, nil}
    end
  end

  defp proceed(_, %{"content-type" => "text/html" <> _}), do: :continue
  defp proceed(_, _), do: :stop

  defp parse(body, %{"content-type" => "text/html" <> _}) do
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
  defp parse(_, _), do: :plain

  defp canonical_url(body, url) do
    case Furlex.Parser.extract_canonical(body) do
      url when is_binary(url) -> url
      _ -> url
    end
  end

  defp normalize(headers) do
    Enum.into(headers, %{}, fn {h, v} -> {String.downcase(h), v} end)
  end
end