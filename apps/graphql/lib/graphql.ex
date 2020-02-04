defmodule GraphQl do
  use Absinthe.Schema
  use Absinthe.Relay.Schema, :modern
  import GraphQl.Schema.Helpers

  alias GraphQl.Resolvers.{
    Conversation,
    User,
    Platform,
    Notification,
    Invite,
    Emoji,
    Brand,
    Plan
  }
  import_types GraphQl.Schema.Types
  import_types GraphQl.Schema.Inputs

  def context(ctx) do
    loader =
      Dataloader.new()
      |> Dataloader.add_source(Conversation, Conversation.data(ctx))
      |> Dataloader.add_source(User, User.data(ctx))
      |> Dataloader.add_source(Platform, Platform.data(ctx))
      |> Dataloader.add_source(Emoji, Emoji.data(ctx))
      |> Dataloader.add_source(Brand, Brand.data(ctx))

    Map.put(ctx, :loader, loader)
  end

  def plugins do
    [Absinthe.Middleware.Dataloader] ++ Absinthe.Plugin.defaults()
  end

  # NB: I'll need to break this up somehow soon
  query do
    @desc "Returns yourself"
    field :me, :user do
      middleware GraphQl.Schema.Authenticated
      resolve fn _, %{context: %{current_user: user}} -> {:ok, user} end
    end

    @desc "Get a user by id"
    field :user, :user do
      middleware GraphQl.Schema.Authenticated
      arg :id, :id
      arg :handle, :string
      arg :email, :string
      resolve &User.resolve_user/3
    end

    @desc "Fetches a list of users in the system"
    connection field :users, node_type: :user do
      middleware GraphQl.Schema.Authenticated
      arg :active, :boolean

      resolve &User.list_users/2
    end

    @desc "Fetches a list of public or private conversations, don't attempt to preload participants or messages plz"
    connection field :conversations, node_type: :conversation do
      middleware GraphQl.Schema.Authenticated
      arg :public, :boolean

      resolve &Conversation.list_conversations/2
    end

    connection field :chats, node_type: :conversation do
      middleware GraphQl.Schema.Authenticated

      resolve fn args, context -> Conversation.list_conversations(Map.put(args, :chat, true), context) end
    end

    connection field :search_conversations, node_type: :conversation do
      middleware GraphQl.Schema.Authenticated
      arg :name, non_null(:string)

      resolve &Conversation.search_conversations/2
    end

    connection field :search_users, node_type: :user do
      middleware GraphQl.Schema.Authenticated
      arg :name, non_null(:string)
      arg :active, :boolean

      resolve &User.search_users/2
    end

    @desc "Fetches an individual conversation"
    field :conversation, :conversation do
      middleware GraphQl.Schema.Authenticated
      arg :id, :id
      arg :name, :string

      resolve &Conversation.resolve_conversation/3
    end

    connection field :commands, node_type: :command do
      middleware GraphQl.Schema.Authenticated
      resolve &Platform.list_commands/2
    end

    connection field :search_commands, node_type: :command do
      middleware GraphQl.Schema.Authenticated
      arg :name, non_null(:string)

      resolve &Platform.search_commands/2
    end

    connection field :notifications, node_type: :notification do
      middleware GraphQl.Schema.Authenticated
      resolve &Notification.list_notifications/2
    end

    connection field :emoji, node_type: :emoji do
      middleware GraphQl.Schema.Authenticated
      resolve &Emoji.list_emoji/2
    end

    field :brand, :brand do
      resolve safe_resolver(&Brand.resolve_brand/2)
    end

    field :plan, :plan_details do
      middleware GraphQl.Schema.Authenticated
      resolve safe_resolver(&Plan.resolve_plan/2)
    end

    connection field :themes, node_type: :theme do
      middleware GraphQl.Schema.Authenticated

      resolve &Brand.list_themes/2
    end

    connection field :installable_commands, node_type: :installable_command do
      middleware GraphQl.Schema.Authenticated

      resolve &Platform.list_installable_commands/2
    end
  end

  mutation do
    field :signup, :user do
      arg :attributes, non_null(:user_attributes)
      arg :invite_token, :string

      resolve safe_resolver(&User.signup/2)
    end

    field :login, :user do
      arg :email, non_null(:string)
      arg :password, non_null(:string)
      arg :invite_token, :string

      resolve safe_resolver(&User.login_user/2)
    end

    field :create_invite, :invite do
      arg :attributes, non_null(:invite_attributes)

      resolve safe_resolver(&Invite.create_invite/2)
    end

    @desc "Creates a new user for this piazza instance"
    field :create_user, :user do
      middleware GraphQl.Schema.Authenticated
      arg :attributes, non_null(:user_attributes)

      resolve safe_resolver(&User.create_user/2)
    end

    @desc "Updates the attributes on a single user"
    field :update_user, :user do
      middleware GraphQl.Schema.Authenticated
      arg :id, non_null(:id)
      arg :attributes, non_null(:user_attributes)

      resolve safe_resolver(&User.update_user/2)
    end

    @desc "Toggles user activation"
    field :activate_user, :user do
      middleware GraphQl.Schema.Authenticated
      arg :id,     non_null(:id)
      arg :active, :boolean

      resolve safe_resolver(&User.activate_user/2)
    end

    @desc "Creates a new conversation"
    field :create_conversation, :conversation do
      middleware GraphQl.Schema.Authenticated
      arg :attributes, non_null(:conversation_attributes)

      resolve safe_resolver(&Conversation.create_conversation/2)
    end

    @desc "Creates a private conversation between the current user and the user specified by user_id"
    field :create_chat, :conversation do
      middleware GraphQl.Schema.Authenticated
      arg :user_id, :id
      arg :user_ids, list_of(:id)

      resolve safe_resolver(&Conversation.create_chat/2)
    end

    @desc "Delete a conversation"
    field :delete_conversation, :conversation do
      middleware GraphQl.Schema.Authenticated
      arg :id, non_null(:id)

      resolve safe_resolver(&Conversation.delete_conversation/2)
    end

    @desc "Updates a conversation by id"
    field :update_conversation, :conversation do
      middleware GraphQl.Schema.Authenticated
      arg :id, non_null(:id)
      arg :attributes, non_null(:conversation_attributes)

      resolve safe_resolver(&Conversation.update_conversation/2)
    end

    @desc "Creates a message in a conversation"
    field :create_message, :message do
      middleware GraphQl.Schema.Authenticated
      arg :conversation_id, non_null(:id)
      arg :attributes, non_null(:message_attributes)

      resolve safe_resolver(&Conversation.create_message/2)
    end

    field :delete_message, :message do
      middleware GraphQl.Schema.Authenticated
      arg :message_id, non_null(:id)

      resolve safe_resolver(&Conversation.delete_message/2)
    end

    field :edit_message, :message do
      middleware GraphQl.Schema.Authenticated
      arg :message_id, non_null(:id)
      arg :attributes, non_null(:message_attributes)

      resolve safe_resolver(&Conversation.update_message/2)
    end

    field :pin_message, :pinned_message do
      middleware GraphQl.Schema.Authenticated
      arg :message_id, non_null(:id)
      arg :pinned, non_null(:boolean)

      resolve safe_resolver(&Conversation.pin_message/2)
    end

    field :create_reaction, :message do
      middleware GraphQl.Schema.Authenticated
      arg :message_id, non_null(:id)
      arg :name, non_null(:string)

      resolve safe_resolver(&Conversation.create_reaction/2)
    end

    field :delete_reaction, :message do
      middleware GraphQl.Schema.Authenticated
      arg :message_id, non_null(:id)
      arg :name, non_null(:string)

      resolve safe_resolver(&Conversation.delete_reaction/2)
    end

    field :create_participant, :participant do
      middleware GraphQl.Schema.Authenticated
      arg :attributes, non_null(:participant_attributes)

      resolve safe_resolver(&Conversation.create_participant/2)
    end

    field :create_participants, list_of(:participant) do
      middleware GraphQl.Schema.Authenticated
      arg :handles, list_of(:string)
      arg :conversation_id, non_null(:id)

      resolve safe_resolver(&Conversation.create_participants/2)
    end

    field :delete_participant, :participant do
      middleware GraphQl.Schema.Authenticated
      arg :conversation_id, non_null(:id)
      arg :user_id, non_null(:id)

      resolve safe_resolver(&Conversation.delete_participant/2)
    end

    @desc "Updates the attributes on a participant (use to modify conversation level notification settings)"
    field :update_participant, :participant do
      middleware GraphQl.Schema.Authenticated
      arg :conversation_id, non_null(:id)
      arg :user_id, non_null(:id)
      arg :notification_preferences, non_null(:notification_prefs)

      resolve safe_resolver(&Conversation.update_participant/2)
    end

    field :create_command, :command do
      middleware GraphQl.Schema.Authenticated
      arg :attributes, non_null(:command_attributes)

      resolve safe_resolver(&Platform.create_command/2)
    end

    field :update_command, :command do
      middleware GraphQl.Schema.Authenticated
      arg :name, non_null(:string)
      arg :attributes, non_null(:command_update_attributes)

      resolve safe_resolver(&Platform.update_command/2)
    end

    field :dispatch_interaction, :interaction do
      middleware GraphQl.Schema.Authenticated
      arg :id, non_null(:id)
      arg :payload, non_null(:string)

      resolve safe_resolver(&Platform.dispatch_interaction/2)
    end

    field :view_notifications, list_of(:notification) do
      middleware GraphQl.Schema.Authenticated
      resolve safe_resolver(&Notification.view_notifications/2)
    end

    field :create_emoji, :emoji do
      middleware GraphQl.Schema.Authenticated
      arg :attributes, non_null(:emoji_attributes)

      resolve safe_resolver(&Emoji.create_emoji/2)
    end

    field :create_theme, :theme do
      middleware GraphQl.Schema.Authenticated
      arg :name, non_null(:string)
      arg :attributes, non_null(:theme_attributes)

      resolve safe_resolver(&Brand.create_theme/2)
    end

    field :set_theme, :theme do
      middleware GraphQl.Schema.Authenticated
      arg :id, non_null(:id)

      resolve safe_resolver(&Brand.set_theme/2)
    end

    field :update_brand, :brand do
      middleware GraphQl.Schema.Authenticated
      arg :attributes, non_null(:brand_attributes)

      resolve safe_resolver(&Brand.update_brand/2)
    end

    field :create_reset_token, :reset_token do
      arg :type,  non_null(:reset_token_type)
      arg :email, non_null(:string)

      resolve safe_resolver(&User.create_reset_token/2)
    end

    field :apply_reset_token, :user do
      arg :id,   non_null(:string)
      arg :args, non_null(:reset_token_args)

      resolve safe_resolver(&User.apply_reset_token/2)
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

    field :dialog, :dialog do
      config fn _, %{context: %{current_user: user}} ->
        {:ok, topic: "dialog:#{user.id}"}
      end
    end

    field :message_delta, :message_delta do
      arg :conversation_id, :id
      config fn
        %{conversation_id: id}, %{context: %{current_user: user}} ->
          Conversation.authorize_subscription(id, user, "messages:#{id}")
        _, %{context: %{current_user: user}} ->
          {:ok, topic: "messages:user:#{user.id}"}
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

    field :command_delta, :command_delta do
      config fn _, _ -> {:ok, topic: "commands"} end
    end

    field :emoji_delta, :emoji_delta do
      config fn _, _ -> {:ok, topic: "emoji"} end
    end

    field :pinned_message_delta, :pinned_message_delta do
      arg :conversation_id, :id
      config fn
        %{conversation_id: id}, %{context: %{current_user: user}} ->
          Conversation.authorize_subscription(id, user, "pinned_messages:#{id}")
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
      try do
        case fun.(args, ctx) do
          {:ok, res} -> {:ok, res}
          {:error, %Ecto.Changeset{} = cs} -> {:error, resolve_changeset(cs)}
          error -> error
        end
      rescue
        error -> {:error, GraphQl.Errors.message(error)}
      end
    end
  end
end
