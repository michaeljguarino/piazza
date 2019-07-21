defmodule Core.Schemas.Types do
  use Core.Schemas.Base
  alias Core.Resolvers.{Conversation, User, Platform}

  object :user do
    field :id, :id
    field :name, non_null(:string)
    field :handle, non_null(:string)
    field :email, non_null(:string)
    field :bio, :string
    field :roles, :roles
    field :deleted_at, :datetime

    timestamps()
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

    timestamps()
  end

  object :participant do
    field :id, :id
    field :conversation_id, non_null(:id)
    field :user_id, non_null(:id)
    field :user, :user, resolve: dataloader(User)
    field :conversation, :conversation, resolve: dataloader(Conversation)

    timestamps()
  end

  object :message do
    field :id, :id
    field :text, non_null(:string)
    field :creator_id, non_null(:id)
    field :conversation_id, non_null(:id)
    field :creator, :user, resolve: dataloader(User)
    field :conversation, :conversation, resolve: dataloader(Conversation)

    timestamps()
  end

  object :roles do
    field :admin, :boolean
  end

  connection node_type: :conversation
  connection node_type: :user
  connection node_type: :message
  connection node_type: :participant

  ## Platform-related types

  object :command do
    field :id, :id
    field :name, :string
    field :documentation, :string

    field :bot, :user, resolve: dataloader(User)
    field :creator, :user, resolve: dataloader(User)
    field :webhook, :webhook, resolve: dataloader(Platform)

    timestamps()
  end

  object :webhook do
    field :id, :id
    field :url, :string
    field :secret, :string # TODO make this actually secret

    timestamps()
  end

  object :incoming_webhook do
    field :secure_id
    field :name, :string

    field :bot, :user, resolve: dataloader(User)
    field :creator, :user, resolve: dataloader(User)
  end

  connection node_type: :command
  connection node_type: :incoming_webhook
end