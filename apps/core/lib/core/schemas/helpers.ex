defmodule Core.Schemas.Helpers do
  alias Absinthe.Schema.Notation.Scope
  def resolve_changeset(%Ecto.Changeset{errors: errors}) do
    Enum.map(errors, fn {field, {msg, _}} -> "#{field} #{msg}" end)
  end

  @doc """
  Absinthe is really not great at tying into individual query/mutation
  fields with its middleware system, so this will hack together a way
  for us to remove authentication middleware selectively
  """
  defmacro unauthorized() do
    env = __CALLER__
    middleware =
      Scope.current(env.module).attrs
      |> Keyword.get(:middleware, [])
    mdlware = Enum.filter(middleware, & &1 != Core.Schemas.Authenticated) |> IO.inspect()
    Scope.put_attribute(env.module, :middleware, mdlware)
    nil
  end
end