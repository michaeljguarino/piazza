defmodule Gql.Clients.Giphy do
  alias Core.Services.License
  alias Gql.Giphy.{Response, Gif, Image, ImageContent}

  require Logger
  @sample_size 30

  def random(search_query, interaction) do
    params = URI.encode_query(%{
      api_key: client_secret(),
      q: search_query,
      limit: @sample_size
    })
    with {:ok, url} <- fetch(params) do
      {:ok, %{dialog: build_dialog(url, search_query, interaction)}}
    end
  end

  def fetch(params) do
    case get("gifs/search?#{params}") do
      {:ok, %Response{data: [_ | _] = results}} -> Enum.random(results) |> select_url()
      _ -> {:error, :not_found}
    end
  end

  def get(path, headers \\ []) do
    path = "#{endpoint()}#{path}"
    retry(fn -> Mojito.get(path, headers) end)
    |> case do
      {:ok, %Mojito.Response{body: body, status_code: 200}} ->
        Response.decode(body)
      error ->
        Logger.error "Error from giphy: #{inspect(error)}"
        {:error, :not_found}
    end
  end

  defp retry(func, retries \\ 0, max_retries \\ 2, result \\ {:error, :not_found})
  defp retry(_, retries, retries, result), do: result
  defp retry(func, retries, max_retries, _) do
    if retries > 0 do
      :timer.sleep(100)
    end

    case func.() do
      {:error, %Mojito.Error{}} = error ->
        retry(func, retries + 1, max_retries, error)
      result -> result
    end
  end

  def build_dialog({url, {width, height}}, search, interaction) do
    pruned = prune_url(url)
    shuffle_payload = Jason.encode!(%{shuffle: search}) |> xml_escape()
    select_payload = Jason.encode!(%{select: pruned, search: search, width: width, height: height}) |> xml_escape()
    """
    <root>
      <box pad="small" gap="small">
        <box>
          <video url="#{pruned}" width="#{width}" height="#{height}" autoPlay="true" loop="true" />
          <link href="#{pruned}" target="_blank">
            View on Giphy
          </link>
        </box>
        <box direction="row" gap="xsmall">
          <button interaction="#{interaction}" payload="#{shuffle_payload}" label="shuffle" />
          <button interaction="#{interaction}" payload="#{select_payload}" label="select" primary="true" />
        </box>
      </box>
    </root>
    """
  end

  def build_message(url, width, height) do
    pruned = prune_url(url)
    """
    <root>
      <box pad="small" gap="xsmall">
        <video url="#{pruned}" width="#{width}" height="#{height}" autoPlay="true" loop="true" />
        <link href="#{pruned}" target="_blank" color="dark-3">
          View on giphy
        </link>
      </box>
    </root>
    """
  end

  defp prune_url(url) do
    URI.parse(url)
    |> Map.put(:query, nil)
    |> URI.to_string()
  end

  defp xml_escape(str) do
    String.replace(str, "\"", "&quot;")
  end

  def select_url(%Gif{images: %Image{original: %ImageContent{mp4: url} = img}}) when not is_nil(url),
    do: {:ok, {url, dimensions(img)}}
  def select_url(%Gif{images: %Image{fixed_height: %ImageContent{mp4: url} = img}}) when not is_nil(url),
    do: {:ok, {url, dimensions(img)}}
  def select_url(%Gif{images: %Image{fixed_width: %ImageContent{mp4: url} = img}}) when not is_nil(url),
    do: {:ok, {url, dimensions(img)}}
  def select_url(%Gif{images: %Image{fixed_height: %ImageContent{url: url} = img}}) when not is_nil(url),
    do: {:ok, {url, dimensions(img)}}
  def select_url(%Gif{images: %Image{original: %ImageContent{url: url} = img}}) when not is_nil(url),
    do: {:ok, {url, dimensions(img)}}
  def select_url(%Gif{images: %Image{fixed_width: %ImageContent{url: url} = img}}) when not is_nil(url),
    do: {:ok, {url, dimensions(img)}}
  def select_url(_), do: {:error, :not_found}

  defp dimensions(%ImageContent{width: width, height: height}), do: {width, height}

  def endpoint(), do: "https://api.giphy.com/v1/"

  def client_secret() do
    case License.fetch() do
      %{secrets: %{"giphySecret" => secret}} -> secret
      _ -> nil
    end
  end
end