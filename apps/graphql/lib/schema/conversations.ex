defmodule GraphQl.Schema.Conversations do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{User, Conversation, Workspace}

  import_types GraphQl.Schema.Messages

  ########
  # INPUTS
  ########

  input_object :conversation_attributes do
    field :public,       :boolean
    field :name,         :string
    field :topic,        :string
    field :global,       :boolean
    field :archived,     :boolean
    field :workspace_id, :id
  end

  input_object :participant_attributes do
    field :conversation_id,          non_null(:string)
    field :user_id,                  non_null(:string)
    field :notification_preferences, :notification_prefs
  end

  ############
  # OBJECTS
  ############

  object :conversation do
    field :id,                  :id
    field :name,                non_null(:string)
    field :public,              non_null(:boolean)
    field :global,              non_null(:boolean)
    field :chat,                non_null(:boolean)
    field :topic,               :string
    field :archived_at,         :datetime
    field :creator,             :user, resolve: dataloader(User)
    field :current_participant, :participant, resolve: dataloader(Conversation)
    field :workspace,           :workspace, resolve: dataloader(Workspace)

    field :pinned_message_count, :integer do
      resolve fn conversation, _, %{context: %{loader: loader}} ->
        manual_dataloader(
          loader, Conversation, {:one, Core.Models.Conversation}, pinned_message_count: conversation)
      end
    end

    field :unread_messages, :integer do
      resolve fn conversation, _, %{context: %{loader: loader, current_user: user}} ->
        manual_dataloader(
          loader, Conversation, {:one, Core.Models.Conversation}, unread_messages: {user, conversation})
      end
    end

    field :unread_notifications, :integer do
      resolve fn conversation, _, %{context: %{loader: loader, current_user: user}} ->
        manual_dataloader(
          loader, Conversation, {:one, Core.Models.Conversation}, unread_notifications: {user, conversation})
      end
    end

    field :participant_count, :integer do
      resolve fn conversation, _, %{context: %{loader: loader}} ->
        manual_dataloader(
          loader, Conversation, {:one, Core.Models.Conversation}, participant_count: conversation)
      end
    end

    field :file_count, :integer do
      resolve fn conversation, _, %{context: %{loader: loader}} ->
        manual_dataloader(
          loader, Conversation, {:one, Core.Models.Conversation}, file_count: conversation)
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

    import_fields :message_queries

    timestamps()
  end

  object :participant do
    field :id, :id
    field :conversation_id, non_null(:id)
    field :user_id, non_null(:id)
    field :notification_preferences, :notification_preferences
    field :user, :user, resolve: dataloader(User)
    field :conversation, :conversation, resolve: dataloader(Conversation)
    field :last_seen_at, :datetime

    timestamps()
  end

  delta :conversation
  delta :participant

  connection node_type: :conversation
  connection node_type: :participant

  object :conversation_queries do
    @desc "Fetches a list of public or private conversations, don't attempt to preload participants or messages plz"
    connection field :conversations, node_type: :conversation do
      middleware GraphQl.Middleware.Authenticated
      arg :public,       :boolean
      arg :workspace_id, :id

      resolve &Conversation.list_conversations/2
    end

    connection field :chats, node_type: :conversation do
      middleware GraphQl.Middleware.Authenticated
      arg :workspace_id, :id

      resolve fn args, context -> Conversation.list_conversations(Map.put(args, :chat, true), context) end
    end

    connection field :search_conversations, node_type: :conversation do
      middleware GraphQl.Middleware.Authenticated
      arg :name,         non_null(:string)
      arg :workspace_id, :id

      resolve &Conversation.search_conversations/2
    end

    @desc "Fetches an individual conversation"
    field :conversation, :conversation do
      middleware GraphQl.Middleware.Authenticated
      arg :id, :id
      arg :name, :string

      resolve &Conversation.resolve_conversation/3
    end
  end

  object :conversation_mutations do
    @desc "Creates a new conversation"
    field :create_conversation, :conversation do
      middleware GraphQl.Middleware.Authenticated
      arg :attributes, non_null(:conversation_attributes)

      resolve safe_resolver(&Conversation.create_conversation/2)
    end

    @desc "Creates a private conversation between the current user and the user specified by user_id"
    field :create_chat, :conversation do
      middleware GraphQl.Middleware.Authenticated
      arg :user_id, :id
      arg :user_ids, list_of(:id)

      resolve safe_resolver(&Conversation.create_chat/2)
    end

    @desc "Delete a conversation"
    field :delete_conversation, :conversation do
      middleware GraphQl.Middleware.Authenticated
      arg :id, non_null(:id)

      resolve safe_resolver(&Conversation.delete_conversation/2)
    end

    @desc "Updates a conversation by id"
    field :update_conversation, :conversation do
      middleware GraphQl.Middleware.Authenticated
      arg :id, non_null(:id)
      arg :attributes, non_null(:conversation_attributes)

      resolve safe_resolver(&Conversation.update_conversation/2)
    end

    field :create_participant, :participant do
      middleware GraphQl.Middleware.Authenticated
      arg :attributes, non_null(:participant_attributes)

      resolve safe_resolver(&Conversation.create_participant/2)
    end

    field :create_participants, list_of(:participant) do
      middleware GraphQl.Middleware.Authenticated
      arg :handles, list_of(:string)
      arg :conversation_id, non_null(:id)

      resolve safe_resolver(&Conversation.create_participants/2)
    end

    field :delete_participant, :participant do
      middleware GraphQl.Middleware.Authenticated
      arg :conversation_id, non_null(:id)
      arg :user_id, non_null(:id)

      resolve safe_resolver(&Conversation.delete_participant/2)
    end

    @desc "Updates the attributes on a participant (use to modify conversation level notification settings)"
    field :update_participant, :participant do
      middleware GraphQl.Middleware.Authenticated
      arg :conversation_id, non_null(:id)
      arg :user_id, non_null(:id)
      arg :notification_preferences, non_null(:notification_prefs)

      resolve safe_resolver(&Conversation.update_participant/2)
    end
  end

  object :conversation_subscriptions do
    field :conversation_delta, :conversation_delta do
      arg :id, non_null(:id)
      config fn %{id: id}, %{context: %{current_user: user}} ->
        Conversation.authorize_subscription(id, user, "conversations:#{id}")
      end
    end

    field :participant_delta, :participant_delta do
      arg :conversation_id, :id
      config fn
        %{conversation_id: id}, %{context: %{current_user: user}} ->
          Conversation.authorize_subscription(id, user, "participants:#{id}")
        _, %{context: %{current_user: %{id: id}}} ->
          {:ok, topic: "participants:mine:#{id}"}
      end
    end
  end
end
