defmodule Core.Schema do
  use Absinthe.Schema
  use Absinthe.Relay.Schema, :modern
  import Core.Schemas.Helpers

  alias Core.Resolvers.{
    Conversation,
    User,
    Platform,
    Notification
  }
  import_types Core.Schemas.Types
  import_types Core.Schemas.Inputs

  def context(ctx) do
    loader =
      Dataloader.new()
      |> Dataloader.add_source(Conversation, Conversation.data(ctx))
      |> Dataloader.add_source(User, User.data(ctx))
      |> Dataloader.add_source(Platform, Platform.data(ctx))

    Map.put(ctx, :loader, loader)
  end

  def plugins do
    [Absinthe.Middleware.Dataloader] ++ Absinthe.Plugin.defaults()
  end

  # NB: I'll need to break this up somehow soon
  query do
    @desc "Returns yourself"
    field :me, :user do
      middleware Core.Schemas.Authenticated
      resolve fn _, %{context: %{current_user: user}} -> {:ok, user} end
    end

    @desc "Get a user by id"
    field :user, :user do
      middleware Core.Schemas.Authenticated
      arg :id, :id
      arg :handle, :string
      arg :email, :string
      resolve &User.resolve_user/3
    end

    @desc "Fetches a list of users in the system"
    connection field :users, node_type: :user do
      middleware Core.Schemas.Authenticated
      resolve &User.list_users/2
    end

    @desc "Fetches a list of public or private conversations, don't attempt to preload participants or messages plz"
    connection field :conversations, node_type: :conversation do
      middleware Core.Schemas.Authenticated
      resolve &Conversation.list_conversations/2
    end

    @desc "Fetches an individual conversation"
    field :conversation, :conversation do
      middleware Core.Schemas.Authenticated
      arg :id, :id
      arg :name, :string

      resolve &Conversation.resolve_conversation/3
    end

    connection field :commands, node_type: :command do
      middleware Core.Schemas.Authenticated
      resolve &Platform.list_commands/2
    end

    connection field :notifications, node_type: :notification do
      middleware Core.Schemas.Authenticated
      resolve &Notification.list_notifications/2
    end
  end

  mutation do
    field :signup, :user do
      arg :attributes, non_null(:user_attributes)

      resolve safe_resolver(&User.signup/2)
    end

    field :login, :user do
      arg :email, non_null(:string)
      arg :password, non_null(:string)

      resolve safe_resolver(&User.login_user/2)
    end

    @desc "Creates a new user for this piazza instance"
    field :create_user, :user do
      middleware Core.Schemas.Authenticated
      arg :attributes, non_null(:user_attributes)

      resolve safe_resolver(&User.create_user/2)
    end

    @desc "Updates the attributes on a single user"
    field :update_user, :user do
      middleware Core.Schemas.Authenticated
      arg :id, non_null(:id)
      arg :attributes, non_null(:user_attributes)

      resolve safe_resolver(&User.update_user/2)
    end

    @desc "Deletes a user by id"
    field :delete_user, :user do
      middleware Core.Schemas.Authenticated
      arg :id, non_null(:id)

      resolve safe_resolver(&User.delete_user/2)
    end

    @desc "Creates a new conversation"
    field :create_conversation, :conversation do
      middleware Core.Schemas.Authenticated
      arg :attributes, non_null(:conversation_attributes)

      resolve safe_resolver(&Conversation.create_conversation/2)
    end

    @desc "Delete a conversation"
    field :delete_conversation, :conversation do
      middleware Core.Schemas.Authenticated
      arg :id, non_null(:id)

      resolve safe_resolver(&Conversation.delete_conversation/2)
    end

    @desc "Updates a conversation by id"
    field :update_conversation, :conversation do
      middleware Core.Schemas.Authenticated
      arg :id, non_null(:id)
      arg :attributes, non_null(:conversation_attributes)

      resolve safe_resolver(&Conversation.update_conversation/2)
    end

    @desc "Creates a message in a conversation"
    field :create_message, :message do
      middleware Core.Schemas.Authenticated
      arg :conversation_id, non_null(:id)
      arg :attributes, non_null(:message_attributes)

      resolve safe_resolver(&Conversation.create_message/2)
    end

    field :create_participant, :participant do
      middleware Core.Schemas.Authenticated
      arg :attributes, non_null(:participant_attributes)

      resolve safe_resolver(&Conversation.create_participant/2)
    end

    field :delete_participant, :participant do
      middleware Core.Schemas.Authenticated
      arg :conversation_id, non_null(:id)
      arg :user_id, non_null(:id)

      resolve safe_resolver(&Conversation.delete_participant/2)
    end

    @desc "Updates the attributes on a participant (use to modify conversation level notification settings)"
    field :update_participant, :participant do
      middleware Core.Schemas.Authenticated
      arg :conversation_id, non_null(:id)
      arg :user_id, non_null(:id)
      arg :notification_preferences, non_null(:notification_prefs)

      resolve safe_resolver(&Conversation.update_participant/2)
    end

    field :create_command, :command do
      middleware Core.Schemas.Authenticated
      arg :attributes, non_null(:command_attributes)

      resolve safe_resolver(&Platform.create_command/2)
    end

    field :update_command, :command do
      middleware Core.Schemas.Authenticated
      arg :name, non_null(:string)
      arg :attributes, non_null(:command_update_attributes)

      resolve safe_resolver(&Platform.update_command/2)
    end

    field :view_notifications, list_of(:notification) do
      middleware Core.Schemas.Authenticated
      resolve safe_resolver(&Notification.view_notifications/2)
    end
  end

  subscription do
    field :user_delta, :user_delta do
      config fn _args, _info -> {:ok, topic: "users"} end
    end

    field :conversation_delta, :conversation_delta do
      arg :id, non_null(:id)
      config fn %{id: id}, %{context: %{current_user: user}} ->
        Conversation.authorize_subscription(id, user, "conversations:#{id}")
      end
    end

    field :message_delta, :message_delta do
      arg :conversation_id, non_null(:id)
      config fn %{conversation_id: id}, %{context: %{current_user: user}} ->
        Conversation.authorize_subscription(id, user, "messages:#{id}")
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

    field :new_notifications, :notification do
      config fn _, %{context: %{current_user: %{id: id}}} ->
        {:ok, topic: "notifications:#{id}"}
      end
    end
  end

  def safe_resolver(fun) do
    fn args, ctx ->
      case fun.(args, ctx) do
        {:ok, res} -> {:ok, res}
        {:error, %Ecto.Changeset{} = cs} -> {:error, resolve_changeset(cs)}
        error -> error
      end
    end
  end
end