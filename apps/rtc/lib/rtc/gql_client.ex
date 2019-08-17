defmodule Rtc.GqlClient do
  alias Thrift.Generated.GqlService.Binary.Framed.Client
  require Logger

  def rpc(method, args) when is_list(args) do
    with {:ok, client} <- Client.start_link(host(), 9090) do
      apply(Client, method, [client | args])
    else
      error ->
        Logger.error("Failed to bootstrap client: #{inspect(error)}")
    end
  end
  def rpc(method, arg), do: rpc(method, [arg])

  defp host(), do: Application.get_env(:rtc, :gql_host)
end