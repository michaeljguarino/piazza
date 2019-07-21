defmodule Gql.Clients.Giphy do
  def random(search_query) do
    params = URI.encode_query(%{
      api_key: client_secret(),
      q: search_query,
      limit: 1
    })
    with {:ok, result} <- get("gifs/search?#{params}"),
      do: select_url(result)
  end

  def get(path, headers \\ []) do
    path = "#{endpoint()}#{path}"
    case Mojito.get(path, headers) do
      {:ok, %Mojito.Response{body: body, status_code: 200}} -> Jason.decode(body)
      _ -> {:error, :not_found}
    end
  end

  def select_url(%{"images" => %{"original" => %{"mp4" => url}}}), do: {:ok, url}
  def select_url(%{"images" => %{"original" => %{"url" => url}}}), do: {:ok, url}
  def select_url(%{"images" => %{"fixed_height" => %{"mp4" => url}}}), do: {:ok, url}
  def select_url(%{"images" => %{"fixed_height" => %{"url" => url}}}), do: {:ok, url}
  def select_url(%{"images" => %{"fixed_width" => %{"mp4" => url}}}), do: {:ok, url}
  def select_url(%{"images" => %{"fixed_width" => %{"url" => url}}}), do: {:ok, url}
  def select_url(_), do: {:error, :not_found}

  def endpoint(), do: "https://api.giphy.com/v1/"

  def client_secret(), do: Application.get_env(:gql, :giphy_secret)
end