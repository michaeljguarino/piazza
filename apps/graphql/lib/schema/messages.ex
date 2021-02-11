defmodule GraphQl.Schema.Messages do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{User, Conversation, Emoji}

  input_object :message_attributes do
    field :text,       :string
    field :attachment, :upload
    field :parent_id,  :id
  end

  object :message do
    field :id, :id
    field :text, non_null(:string)
    field :creator_id, non_null(:id)
    field :conversation_id, non_null(:id)
    field :reply_count, non_null(:integer)
    field :structured_message, :map
    field :pinned_at, :datetime
    field :file, :file, resolve: dataloader(Conversation)
    field :creator, :user, resolve: dataloader(User)
    field :conversation, :conversation, resolve: dataloader(Conversation)
    field :entities, list_of(:message_entity), resolve: dataloader(Conversation)
    field :reactions, list_of(:message_reaction), resolve: dataloader(Conversation)
    field :pin, :pinned_message, resolve: dataloader(Conversation)
    field :parent, :message, resolve: dataloader(Conversation)
    field :embed, :embed

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

  object :embed do
    field :type,        :embed_type
    field :video_type,  :video_type
    field :url,         :string
    field :image_url,   :string
    field :author,      :string
    field :title,       :string
    field :description, :string
    field :height,      :integer
    field :width,       :integer
    field :publisher,   :string
    field :logo,        :string
  end

  ecto_enum :embed_type, Core.Models.Embed.Type
  ecto_enum :video_type, Core.Models.Embed.VideoType

  object :message_reaction do
    field :id,         non_null(:id)
    field :user_id,    non_null(:id)
    field :message_id, non_null(:id)
    field :name,       non_null(:string)

    field :user, :user, resolve: dataloader(User)

    timestamps()
  end

  ecto_enum :entity_type, Core.Models.MessageEntity.Type

  object :message_entity do
    field :id,   :id
    field :type, :entity_type
    field :text, :string

    field :start_index, :integer
    field :length,      :integer

    field :user,  :user,  resolve: dataloader(User)
    field :emoji, :emoji, resolve: dataloader(Emoji)
  end

  ecto_enum :media_type, Core.Models.File.MediaType

  object :file do
    field :id,     non_null(:id)
    field :object, non_null(:string), resolve: fn
      file, _, _ -> {:ok, Core.Storage.url({file.object, file}, :original)}
    end

    field :filename,     non_null(:string)
    field :filesize,     :integer
    field :media_type,   :media_type
    field :content_type, :string
    field :width,        :integer
    field :height,       :integer

    timestamps()
  end

  delta :message
  delta :pinned_message

  connection node_type: :message
  connection node_type: :file
  connection node_type: :pinned_message

  object :message_queries do
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

    connection field :files, node_type: :file do
      resolve &Conversation.list_files/2
    end
  end

  object :message_mutations do
    @desc "Creates a message in a conversation"
    field :create_message, :message do
      middleware GraphQl.Middleware.Authenticated
      arg :conversation_id, non_null(:id)
      arg :attributes, non_null(:message_attributes)

      resolve safe_resolver(&Conversation.create_message/2)
    end

    field :delete_message, :message do
      middleware GraphQl.Middleware.Authenticated
      arg :message_id, non_null(:id)

      resolve safe_resolver(&Conversation.delete_message/2)
    end

    field :edit_message, :message do
      middleware GraphQl.Middleware.Authenticated
      arg :message_id, non_null(:id)
      arg :attributes, non_null(:message_attributes)

      resolve safe_resolver(&Conversation.update_message/2)
    end

    field :pin_message, :pinned_message do
      middleware GraphQl.Middleware.Authenticated
      arg :message_id, non_null(:id)
      arg :pinned, non_null(:boolean)

      resolve safe_resolver(&Conversation.pin_message/2)
    end

    field :create_reaction, :message do
      middleware GraphQl.Middleware.Authenticated
      arg :message_id, non_null(:id)
      arg :name, non_null(:string)

      resolve safe_resolver(&Conversation.create_reaction/2)
    end

    field :delete_reaction, :message do
      middleware GraphQl.Middleware.Authenticated
      arg :message_id, non_null(:id)
      arg :name, non_null(:string)

      resolve safe_resolver(&Conversation.delete_reaction/2)
    end
  end

  object :message_subscriptions do
    field :message_delta, :message_delta do
      arg :conversation_id, :id
      config fn
        %{conversation_id: id}, %{context: %{current_user: user}} ->
          Conversation.authorize_subscription(id, user, "messages:#{id}")
        _, %{context: %{current_user: user}} ->
          {:ok, topic: "messages:user:#{user.id}"}
      end
    end

    field :pinned_message_delta, :pinned_message_delta do
      arg :conversation_id, :id
      config fn
        %{conversation_id: id}, %{context: %{current_user: user}} ->
          Conversation.authorize_subscription(id, user, "pinned_messages:#{id}")
      end
    end
  end
end
