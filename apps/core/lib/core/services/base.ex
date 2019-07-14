defmodule Core.Services.Base do
  defmacro __using__(_) do
    quote do
      import Core.Services.Base
    end
  end

  def when_ok({:ok, resource}, :insert), do: Core.Repo.insert(resource)
  def when_ok({:ok, resource}, :update), do: Core.Repo.update(resource)
  def when_ok(error, _), do: error
end