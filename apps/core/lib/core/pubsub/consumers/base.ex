defmodule Core.PubSub.Consumers.Base do
  defmacro __using__(max_demand: demand) do
    quote do
      use ConsumerSupervisor

      def start_link(arg) do
        ConsumerSupervisor.start_link(__MODULE__, arg)
      end

      def init(_arg) do
        children = [%{id: Core.Consumers.Worker, start: {Core.Consumers.Worker, :start_link, [__MODULE__]}, restart: :temporary}]
        opts = [strategy: :one_for_one, subscribe_to: [{Core.PubSub.Broadcaster, max_demand: unquote(demand)}]]
        ConsumerSupervisor.init(children, opts)
      end
    end
  end
end

defmodule Core.Consumers.Worker do
  def start_link(handler, event) do
    Task.start_link(fn ->
      handler.handle_event(event)
    end)
  end
end