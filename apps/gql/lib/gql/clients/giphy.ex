defmodule Gql.Clients.Giphy do
  @sample_size 10

  def random(search_query) do
    params = URI.encode_query(%{
      api_key: client_secret(),
      q: search_query,
      limit: @sample_size
    })
    with {:ok, url}    <- fetch(params) do
      {:ok, build_message("This is what I found for #{search_query}", url)}
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

  def build_message(text, url) do
    %{
      text: text,
      structured_message: """
        <root>
          <box pad="small">
            <link href="#{url}" target="_blank">
              <video url="#{url}" autoPlay="true" loop="true" />
            </link>
          </box>
        </root>
      """
    }
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