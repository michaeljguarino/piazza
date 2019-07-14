defmodule Core.Schema do
  use Absinthe.Schema
  use Absinthe.Relay.Schema, :modern

  alias Core.Resolvers.{Conversation, User}
  import_types Core.Schemas.Types

  def context(ctx) do
    loader =
      Dataloader.new()
      |> Dataloader.add_source(Conversation, Conversation.data(ctx))
      |> Dataloader.add_source(User, User.data(ctx))

    Map.put(ctx, :loader, loader)
  end

  def plugins do
    [Absinthe.Middleware.Dataloader] ++ Absinthe.Plugin.defaults()
  end

  # NB: I'll need to break this up somehow soon
  query do
    @desc "Get a user by id"
    field :user, :user do
      arg :id, type: non_null(:id)
      resolve &User.resolve_user/3
    end

    @desc "Fetches a list of users in the system"
    connection field :users, node_type: :user do
      resolve &User.list_users/2
    end

    @desc "Fetches a list of public or private conversations, don't attempt to preload participants or messages plz"
    connection field :conversations, node_type: :conversation do
      arg :public, non_null(:boolean)
      resolve &Conversation.list_conversations/2
    end

    @desc "Fetches an individual conversation"
    field :conversation, :conversation do
      arg :id, non_null(:id)
      resolve &Conversation.resolve_conversation/3
    end
  end
end