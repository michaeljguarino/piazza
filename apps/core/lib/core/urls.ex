defmodule Core.Urls do
  def gql_url(path) do
    "https://#{gql_host()}#{path}"
  end

  defp gql_host() do
    url_opts = Application.get_env(:gql, GqlWeb.Endpoint)[:url]
    url_opts[:host]
  end
end