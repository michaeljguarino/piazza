defmodule GraphQl do
  use Absinthe.Schema
  use Absinthe.Relay.Schema, :modern
  import GraphQl.Schema.Helpers

  alias GraphQl.Resolvers.{
    Conversation,
    User,
    Platform,
    Emoji,
    Brand,
    Workspace
  }

  import_types Absinthe.Type.Custom
  import_types Absinthe.Plug.Types
  import_types GraphQl.Schema.{CustomTypes, Upload, Users, Workspace, Conversations, Platform}

  @sources [
    Conversation,
    User,
    Platform,
    Emoji,
    Brand,
    Workspace
  ]

  def context(ctx) do
    loader = make_dataloader(@sources, ctx)
    Map.put(ctx, :loader, loader)
  end

  defp make_dataloader(sources, ctx) do
    Enum.reduce(sources, Dataloader.new(), fn source, loader ->
      Dataloader.add_source(loader, source, source.data(ctx))
    end)
  end

  def middleware(middlewares, field, object) do
	  GraphQl.Instrumenter.instrument(middlewares, field, object)
  end

  def plugins do
    [Absinthe.Middleware.Dataloader] ++ Absinthe.Plugin.defaults()
  end

  query do
    import_fields :user_queries
    import_fields :conversation_queries
    import_fields :platform_queries
    import_fields :workspace_queries
  end

  mutation do
    import_fields :user_mutations
    import_fields :message_mutations
    import_fields :conversation_mutations
    import_fields :platform_mutations
    import_fields :workspace_mutations
  end

  subscription do
    import_fields :user_subscriptions
    import_fields :message_subscriptions
    import_fields :conversation_subscriptions
    import_fields :platform_subscriptions
    import_fields :workspace_subscriptions
  end
end
