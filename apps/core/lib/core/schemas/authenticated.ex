defmodule Core.Schemas.Authenticated do
  @behaviour Absinthe.Middleware
  alias Core.Models.User

  def call(%{context: %{current_user: %User{}}} = res, _config), do: res
  def call(resolution, _) do
    Absinthe.Resolution.put_result(resolution, {:error, "unauthenticated"})
  end
end