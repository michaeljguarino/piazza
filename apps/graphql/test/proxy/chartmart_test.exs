defmodule GraphQl.Proxy.ChartmartTest do
  use GraphQl.SchemaCase
  alias GraphQl.Proxy.Chartmart
  import Mock

  @url "#{Application.get_env(:core, :chartmart_url)}/gql"
  @body Jason.encode!(%{data: %{integrations: %{
    pageInfo: %{hasNextPage: true, endCursor: "cursor"},
    edges: [
      %{
        node: %{
          id: "some-id",
          name: "github",
          description: "description",
          icon: "icon",
          spec: %{
            documentation: "docs",
            webhook: "webhook"
          }
        }
      },
    ]
  }}})

  describe "#list_integrations" do
    test_with_mock "It will convert to connection format", Mojito,
      [post: fn @url, _, _ -> {:ok, %Mojito.Response{body: @body}} end] do

      {:ok, %{page_info: page_info, edges: edges}} = Chartmart.list_integrations(5)

      assert page_info.has_next_page
      assert page_info.end_cursor

      assert length(edges) == 1
      assert Enum.all?(edges, fn
        %{node: %{id: _, name: _, documentation: _, description: _, avatar: _, webhook: _}} -> true
        _ -> false
      end)
    end
  end
end