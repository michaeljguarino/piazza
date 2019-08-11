defmodule Core.Schemas.Types do
  use Core.Schemas.Base
  alias Core.Resolvers.{Conversation, User, Platform}

  object :user do
    field :id, :id
    field :name, non_null(:string)
    field :handle, non_null(:string)
    field :email, non_null(:string)
    field :bot, :boolean
    field :bio, :string
    field :roles, :roles
    field :deleted_at, :datetime
    field :notification_preferences, :notification_preferences
    field :jwt, :string, resolve: fn
      %{jwt: jwt, id: id}, _, %{context: %{current_user: %{id: id}}} ->
        {:ok, jwt}
      _, _, %{context: %{current_user: %{}}} -> {:error, "you can only view your own jwt"}
      %{jwt: jwt}, _, _ -> {:ok, jwt}
    end

    field :avatar, :string, resolve: fn
      user, _, _ -> {:ok, Core.Storage.url({user.avatar, user}, :original)}
    end

    field :background_color, :string, resolve: fn user, _, _ ->
      {:ok, User.background_color(user)}
    end

    field :unseen_notifications, :integer, resolve: fn
      %{id: id} = user, _, %{context: %{current_user: %{id: id}}} ->
        {:ok, Core.Services.Notifications.unseen_count(user)}
      _, _, _ -> {:error, "Cannot fetch notification counts for other users"}
    end

    timestamps()
  end

  delta :user

  object :conversation do
    field :id, :id
    field :name, non_null(:string)
    field :public, non_null(:boolean)
    field :global, non_null(:boolean)
    field :topic, :string
    field :creator, :user, resolve: dataloader(User)
    field :current_participant, :participant, resolve: dataloader(Conversation)

    field :unread_messages, :integer do
      resolve fn conversation, _, %{context: %{loader: loader, current_user: user}} ->
        queryable = {:one, Core.Models.Conversation}
        loader
        |> Dataloader.load(Conversation, queryable, unread_messages: {user, conversation})
        |> on_load(fn loader ->
          {:ok, Dataloader.get(loader, Conversation, queryable, unread_messages: {user, conversation})}
        end)
      end
    end

    field :participant_count, :integer do
      resolve fn conversation, _, %{context: %{loader: loader}} ->
        queryable = {:one, Core.Models.Conversation}
        loader
        |> Dataloader.load(Conversation, queryable, participant_count: conversation)
        |> on_load(fn loader ->
          {:ok, Dataloader.get(loader, Conversation, queryable, participant_count: conversation)}
        end)
      end
    end

    connection field :messages, node_type: :message do
      resolve &Conversation.list_messages/2
    end

    connection field :participants, node_type: :participant do
      resolve &Conversation.list_participants/2
    end

    connection field :pinned_messages, node_type: :message do
      resolve &Conversation.list_pinned_messages/2
    end

    timestamps()
  end

  delta :conversation

  object :participant do
    field :id, :id
    field :conversation_id, non_null(:id)
    field :user_id, non_null(:id)
    field :notification_preferences, :notification_preferences
    field :user, :user, resolve: dataloader(User)
    field :conversation, :conversation, resolve: dataloader(Conversation)

    timestamps()
  end

  delta :participant

  object :message do
    field :id, :id
    field :text, non_null(:string)
    field :creator_id, non_null(:id)
    field :conversation_id, non_null(:id)
    field :pinned_at, :datetime
    field :attachment, :string, resolve: fn
      message, _, _ -> {:ok, Core.Storage.url({message.attachment, message}, :original)}
    end
    field :creator, :user, resolve: dataloader(User)
    field :conversation, :conversation, resolve: dataloader(Conversation)
    field :entities, list_of(:message_entity), resolve: dataloader(Conversation)
    field :reactions, list_of(:message_reaction), resolve: dataloader(Conversation)
    field :embed, :embed

    timestamps()
  end

  object :message_reaction do
    field :id, non_null(:id)
    field :user_id, non_null(:id)
    field :message_id, non_null(:id)
    field :name, non_null(:string)
    field :user, :user, resolve: dataloader(User)

    timestamps()
  end

  delta :message

  enum :entity_type do
    value :mention
  end

  object :message_entity do
    field :id, :id
    field :type, :entity_type
    field :user, :user, resolve: dataloader(User)
    field :start_index, :integer
    field :length, :integer
  end

  enum :notification_type do
    value :mention
    value :message
    value :participant
  end

  object :embed do
    field :type,        :embed_type
    field :url,         :string
    field :image_url,   :string
    field :author,      :string
    field :title,       :string
    field :description, :string
    field :height,      :integer
    field :width,       :integer
  end

  enum :embed_type do
    value :image
    value :video
    value :attachment
    value :site
    value :other
  end

  object :notification do
    field :id, :id
    field :type, :notification_type
    field :user, :user, resolve: dataloader(User)
    field :actor, :user, resolve: dataloader(User)
    field :message, :message, resolve: dataloader(Conversation)
    field :seen_at, :datetime

    timestamps()
  end

  delta :notification

  object :notification_preferences do
    field :mention, :boolean
    field :message, :boolean
    field :participant, :boolean
  end

  object :roles do
    field :admin, :boolean
  end

  connection node_type: :conversation
  connection node_type: :user
  connection node_type: :message
  connection node_type: :participant
  connection node_type: :notification

  ## Platform-related types

  object :command do
    field :id, :id
    field :name, :string
    field :documentation, :string
    field :description, :string

    field :bot, :user, resolve: dataloader(User)
    field :creator, :user, resolve: dataloader(User)
    field :webhook, :webhook, resolve: dataloader(Platform)

    timestamps()
  end

  delta :command

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