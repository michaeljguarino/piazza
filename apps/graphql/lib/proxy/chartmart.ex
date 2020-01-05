defmodule GraphQl.Proxy.Chartmart do
  @headers [
    {"accept", "application/json"},
    {"content-type", "application/json"}
  ]

  @intg_doc """
  query Integrations($limit: Int!, $cursor: String) {
    integrations(repositoryName: "piazza", first: $limit, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          name
          icon
          description
          spec
        }
      }
    }
  }
  """

  def list_integrations(limit, cursor \\ nil) do
    Mojito.post(url(), @headers, Jason.encode!(%{
      query: @intg_doc,
      variables: prune(limit: limit, cursor: cursor)
    }))
    |> decode("integrations")
    |> as_connection(fn %{"node" => node} ->
      %{
        node: %{
          id: node["id"],
          name: node["name"],
          description: node["description"],
          documentation: node["spec"]["documentation"],
          webhook: node["spec"]["webhook"],
          avatar: node["icon"]
        }
      }
    end)
  end

  defp decode({:ok, %{body: body}}, key) do
    case Jason.decode!(body) do
      %{"data" => data} when not is_nil(data) -> {:ok, data[key]}
      %{"errors" => errors} -> {:error, errors}
    end
  end
  defp decode({:error, _}, _), do: {:error, "network error"}

  defp as_connection({:ok, %{"pageInfo" => %{"hasNextPage" => next, "endCursor" => cursor}, "edges" => edges}}, mapper) do
    {:ok, %{
      page_info: %{has_next_page: next, end_cursor: cursor},
      edges: Enum.map(edges, mapper)
    }}
  end
  defp as_connection(error, _), do: error

  defp prune(args) do
    Enum.filter(args, fn {_, val} -> val end)
    |> Map.new()
  end

  def url(), do: "#{Application.get_env(:core, :chartmart_url)}/gql"
end