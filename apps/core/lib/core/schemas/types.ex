defmodule Core.Schemas.Types do
  use Core.Schemas.Base
  alias Core.Resolvers.{Conversation, User, Platform, Emoji, Brand}

  object :user do
    field :id,         :id
    field :name,       non_null(:string)
    field :handle,     non_null(:string)
    field :email,      non_null(:string)
    field :bot,        :boolean
    field :bio,        :string
    field :roles,      :roles
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
    field :id,                  :id
    field :name,                non_null(:string)
    field :public,              non_null(:boolean)
    field :global,              non_null(:boolean)
    field :chat,                non_null(:boolean)
    field :topic,               :string
    field :creator,             :user, resolve: dataloader(User)
    field :current_participant, :participant, resolve: dataloader(Conversation)

    field :pinned_message_count, :integer do
      resolve fn conversation, _, %{context: %{loader: loader}} ->
        queryable = {:one, Core.Models.Conversation}
        loader
        |> Dataloader.load(Conversation, queryable, pinned_message_count: conversation)
        |> on_load(fn loader ->
          {:ok, Dataloader.get(loader, Conversation, queryable, pinned_message_count: conversation)}
        end)
      end
    end

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

    field :unread_notifications, :integer do
      resolve fn conversation, _, %{context: %{loader: loader, current_user: user}} ->
        queryable = {:one, Core.Models.Conversation}
        loader
        |> Dataloader.load(Conversation, queryable, unread_notifications: {user, conversation})
        |> on_load(fn loader ->
          {:ok, Dataloader.get(loader, Conversation, queryable, unread_notifications: {user, conversation})}
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

    field :chat_participants, list_of(:participant) do
      resolve fn conversation, _, %{context: %{loader: loader}} ->
        queryable = {:many, Core.Models.Conversation}
        loader
        |> Dataloader.load(Conversation, queryable, chat_participants: conversation)
        |> on_load(fn loader ->
          {:ok, Dataloader.get(loader, Conversation, queryable, chat_participants: conversation)}
        end)
      end
    end

    connection field :messages, node_type: :message do
      arg :anchor,    :datetime
      arg :direction, :direction
      resolve &Conversation.list_messages/2
    end

    connection field :search_messages, node_type: :message do
      arg :query, :string
      resolve &Conversation.search_messages/2
    end

    connection field :participants, node_type: :participant do
      resolve &Conversation.list_participants/2
    end

    connection field :pinned_messages, node_type: :pinned_message do
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

  object :pinned_message do
    field :id, :id
    field :conversation_id, non_null(:id)
    field :message_id,      non_null(:id)

    field :conversation, :conversation, resolve: dataloader(Conversation)
    field :message,      :message, resolve: dataloader(Conversation)
    field :user,         :user, resolve: dataloader(User)

    timestamps()
  end

  object :invite do
    field :id,      :id
    field :token,   :string, resolve: fn
      invite, _, _ -> Core.Services.Invites.gen_token(invite)
    end

    field :creator, :user, resolve: dataloader(User)

    timestamps()
  end

  delta :pinned_message
  delta :participant

  object :message do
    field :id, :id
    field :text, non_null(:string)
    field :creator_id, non_null(:id)
    field :conversation_id, non_null(:id)
    field :structured_message, :map
    field :pinned_at, :datetime
    field :attachment, :string, resolve: fn
      message, _, _ -> {:ok, Core.Storage.url({message.attachment, message}, :original)}
    end
    field :creator, :user, resolve: dataloader(User)
    field :conversation, :conversation, resolve: dataloader(Conversation)
    field :entities, list_of(:message_entity), resolve: dataloader(Conversation)
    field :reactions, list_of(:message_reaction), resolve: dataloader(Conversation)
    field :pin, :pinned_message, resolve: dataloader(Conversation)
    field :embed, :embed

    timestamps()
  end

  object :message_reaction do
    field :id,         non_null(:id)
    field :user_id,    non_null(:id)
    field :message_id, non_null(:id)
    field :name,       non_null(:string)

    field :user, :user, resolve: dataloader(User)

    timestamps()
  end

  delta :message

  enum :entity_type do
    value :mention
    value :emoji
  end

  object :message_entity do
    field :id,   :id
    field :type, :entity_type
    field :text, :string

    field :start_index, :integer
    field :length,      :integer

    field :user,  :user,  resolve: dataloader(User)
    field :emoji, :emoji, resolve: dataloader(Emoji)
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
  connection node_type: :pinned_message

  ## Platform-related types

  object :command do
    field :id, :id
    field :name, :string
    field :documentation, :string
    field :description, :string

    field :bot, :user, resolve: dataloader(User)
    field :creator, :user, resolve: dataloader(User)
    field :webhook, :webhook, resolve: dataloader(Platform)
    field :incoming_webhook, :incoming_webhook, resolve: dataloader(Platform)

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
    field :secure_id, :id
    field :name, :string
    field :url, :string, resolve: fn %{secure_id: secure_id}, _, _ ->
      {:ok, Core.Urls.gql_url("/external/incoming_webhooks/#{secure_id}")}
    end

    field :bot, :user, resolve: dataloader(User)
    field :creator, :user, resolve: dataloader(User)
    field :conversation, :conversation, resolve: dataloader(Conversation)
  end

  connection node_type: :command
  connection node_type: :incoming_webhook

  object :emoji do
    field :id, :id
    field :name, non_null(:string)
    field :fullname, :string
    field :image_url, :string, resolve: fn emoji, _, _ ->
      {:ok, Core.Storage.url({emoji.image, emoji}, :original)}
    end
    field :creator, :user, resolve: dataloader(User)

    timestamps()
  end

  connection node_type: :emoji
  delta :emoji

  object :brand do
    field :theme, :theme, resolve: fn brand, _, context -> Brand.get_theme(brand, context) end

    timestamps()
  end

  object :theme do
    field :id, :id
    field :name, non_null(:string)

    field :brand,         :string
    field :sidebar,       :string
    field :sidebar_hover, :string
    field :focus,         :string
    field :action,        :string
    field :action_hover,  :string
    field :focus_text,    :string
    field :active_text,   :string
    field :tag_light,     :string
    field :tag_medium,    :string
    field :presence,      :string
    field :notif,         :string
    field :link,          :string

    field :creator, :user, resolve: dataloader(User)
    timestamps()
  end

  object :builtin_command do
    field :name, :string
    field :description, :string
    field :documentation, :string
    field :webhook, :string
    field :avatar, :string
  end

  connection node_type: :theme
end