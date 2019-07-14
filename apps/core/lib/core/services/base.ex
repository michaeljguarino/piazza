defmodule Core.Services.Base do
  defmacro __using__(_) do
    quote do
      import Core.Services.Base
    end
  end

  def when_ok({:ok, resource}, :insert), do: Core.Repo.insert(resource)
  def when_ok({:ok, resource}, :update), do: Core.Repo.update(resource)
  def when_ok(error, _), do: error

  def handle_notify(event_type, resource, additional \\ %{}) do
    Map.new(additional)
    |> Map.put(:item, resource)
    |> event_type.__struct__()
    |> Core.PubSub.Broadcaster.notify()
    |> case do
      :ok   -> {:ok, resource}
      _error -> {:error, :internal_error}
    end
  end
end