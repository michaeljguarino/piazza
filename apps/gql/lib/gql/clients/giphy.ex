defmodule Gql.Clients.Giphy do
  @sample_size 10

  def random(search_query, interaction) do
    params = URI.encode_query(%{
      api_key: client_secret(),
      q: search_query,
      limit: @sample_size
    })
    with {:ok, url}    <- fetch(params) do
      {:ok, %{dialog: build_dialog(url, search_query, interaction)}}
    end
  end

  def fetch(params) do
    case get("gifs/search?#{params}") do
      {:ok, %{"data" => [_ | _] = results}} ->  Enum.random(results) |> select_url()
      _ -> {:error, :not_found}
    end
  end

  def get(path, headers \\ []) do
    path = "#{endpoint()}#{path}"
    case Mojito.get(path, headers) do
      {:ok, %Mojito.Response{body: body, status_code: 200}} -> Jason.decode(body)
      _ -> {:error, :not_found}
    end
  end

  def build_dialog(url, search, interaction) do
    pruned = prune_url(url)
    shuffle_payload = Jason.encode!(%{shuffle: search}) |> xml_escape()
    select_payload = Jason.encode!(%{select: pruned, search: search}) |> xml_escape()
    """
    <root>
      <box pad="small">
        <link href="#{pruned}" target="_blank">
          <video url="#{pruned}" autoPlay="true" loop="true" />
        </link>
      </box>
      <box direction="row" gap="xsmall">
        <button interaction="#{interaction}" payload="#{shuffle_payload}" label="shuffle" />
        <button interaction="#{interaction}" payload="#{select_payload}" label="select" primary="true" />
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

  def client_secret(), do: Application.get_env(:gql, :giphy_secret)
end