defmodule Core.DB.Schema do
  defmacro __using__(_) do
    quote do
      use Ecto.Schema
      import Ecto.Query
      import Ecto.Changeset
      import Core.DB.Schema

      @primary_key {:id, :binary_id, autogenerate: true}
      @foreign_key_type :binary_id

      def any(), do: from(r in __MODULE__)

      def for_id(query \\ __MODULE__, id), do: from(r in query, where: r.id == ^id)

      defoverridable [any: 0]
    end
  end
end