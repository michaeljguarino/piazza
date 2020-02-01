defmodule GraphQl.Resolvers.Plan do
  alias Core.Services.License

  def resolve_plan(_, %{context: %{current_user: %{roles: %{admin: true}}}}) do
    {:ok, %{license: license(), usage: usage()}}
  end
  def resolve_plan(_, _), do: {:error, "Only admins can query plan details"}

  defp usage(), do: %{user: License.usage(:user)}

  defp license(), do: License.fetch().policy
end