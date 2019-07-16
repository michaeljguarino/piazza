defmodule Core.Schemas.Types do
  use Absinthe.Schema.Notation
  use Absinthe.Relay.Schema.Notation, :modern
  import Absinthe.Resolution.Helpers
  alias Core.Resolvers.{Conversation, User}

  import_types Absinthe.Type.Custom

  object :user do
    field :id, :id
    field :name, non_null(:string)
    field :handle, non_null(:string)
    field :email, non_null(:string)
    field :bio, :string
    field :roles, :roles
    field :deleted_at, :datetime
  end

  object :conversation do
    field :id, :id
    field :name, non_null(:string)
    field :public, non_null(:boolean)
    field :global, non_null(:boolean)
    field :creator, :user, resolve: dataloader(User)
    connection field :messages, node_type: :message do
      resolve &Conversation.list_messages/2
    end
    connection field :participants, node_type: :participant do
      resolve &Conversation.list_participants/2
    end
  end

  object :participant do
    field :id, :id
    field :conversation_id, non_null(:id)
    field :user_id, non_null(:id)
    field :user, :user, resolve: dataloader(User)
    field :conversation, :conversation, resolve: dataloader(Conversation)
  end

  object :message do
    field :id, :id
    field :text, non_null(:string)
    field :creator_id, non_null(:id)
    field :conversation_id, non_null(:id)
    field :creator, :user, resolve: dataloader(User)
    field :conversation, :conversation, resolve: dataloader(Conversation)
  end

  object :roles do
    field :admin, :boolean
  end

  connection node_type: :conversation
  connection node_type: :user
  connection node_type: :message
  connection node_type: :participant
end