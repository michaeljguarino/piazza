defmodule Gql.Clients.Giphy do
  alias Core.Services.License

  require Logger
  @sample_size 15

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
      {:ok, %{"data" => [_ | _] = results}} -> Enum.random(results) |> select_url()
      _ -> {:error, :not_found}
    end
  end

  def get(path, headers \\ []) do
    path = "#{endpoint()}#{path}"
    retry(fn -> Mojito.get(path, headers) end)
    |> case do
      {:ok, %Mojito.Response{body: body, status_code: 200}} -> Jason.decode(body)
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

  def build_dialog(url, search, interaction) do
    pruned = prune_url(url)
    shuffle_payload = Jason.encode!(%{shuffle: search}) |> xml_escape()
    select_payload = Jason.encode!(%{select: pruned, search: search}) |> xml_escape()
    """
    <root>
      <box pad="small" gap="small">
        <box>
          <link href="#{pruned}" target="_blank">
            <video url="#{pruned}" autoPlay="true" loop="true" />
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

  def build_message(url) do
    pruned = prune_url(url)
    """
    <root>
      <box pad="small">
        <link href="#{pruned}" target="_blank">
          <video url="#{pruned}" autoPlay="true" loop="true" />
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

  def select_url(%{"images" => %{"original" => %{"mp4" => url}}}), do: {:ok, url}
  def select_url(%{"images" => %{"original" => %{"url" => url}}}), do: {:ok, url}
  def select_url(%{"images" => %{"fixed_height" => %{"mp4" => url}}}), do: {:ok, url}
  def select_url(%{"images" => %{"fixed_height" => %{"url" => url}}}), do: {:ok, url}
  def select_url(%{"images" => %{"fixed_width" => %{"mp4" => url}}}), do: {:ok, url}
  def select_url(%{"images" => %{"fixed_width" => %{"url" => url}}}), do: {:ok, url}
  def select_url(%{"embed_url" => url}), do: {:ok, url}
  def select_url(_), do: {:error, :not_found}

  def endpoint(), do: "https://api.giphy.com/v1/"

  def client_secret() do
    case License.fetch() do
      %{secrets: %{"giphySecret" => secret}} -> secret
      _ -> nil
    end
  end
end