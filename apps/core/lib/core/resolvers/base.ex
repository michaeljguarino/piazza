defmodule Core.Resolvers.Base do
  alias Absinthe.Relay
  defmacro __using__(model: model) do
    quote do
      import Core.Resolvers.Base
      alias unquote(model)
      def data(args \\ %{}), do: Dataloader.Ecto.new(Core.Repo, query: &query/2, default_params: args)

      def query(_queryable, _args), do: unquote(model).any()

      defoverridable [query: 2]
    end
  end

  def paginate(query, args) do
    Relay.Connection.from_query(query, &Core.Repo.all/1, args)
  end
end