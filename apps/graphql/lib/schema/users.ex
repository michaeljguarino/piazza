defmodule GraphQl.Schema.Users do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{User, Conversation, Notification, Invite}

  ############
  # INPUTS
  ############

  input_object :user_attributes do
    field :name,     :string
    field :email,    :string
    field :password, :string
    field :handle,   :string
    field :bio,      :string
    field :roles,    :role_attributes
    field :avatar,   :upload
    field :title,    :string
    field :phone,    :string
    field :notification_preferences, :notification_prefs

    field :status,            :status_attributes
    field :status_expires_at, :datetime
  end

  input_object :status_attributes do
    field :text, non_null(:string)
    field :emoji, :string
  end

  input_object :notification_prefs do
    field :mention,     :boolean
    field :message,     :boolean
    field :participant, :boolean
  end

  input_object :role_attributes do
    field :admin, :boolean
  end

  ecto_enum :reset_token_type, Core.Models.ResetToken.Type

  input_object :reset_token_args do
    field :password, :string
  end

  ecto_enum :invite_type, Core.Models.Invite.Type

  input_object :invite_attributes do
    field :type,      :invite_type
    field :reference, non_null(:string)
  end

  ############
  # OBJECTS
  ############

  object :reset_token do
    field :id,        :id
    field :secure_id, :string
    field :email,     :string
  end

  object :user do
    field :id,         non_null(:id)
    field :name,       non_null(:string)
    field :handle,     non_null(:string)
    field :email,      non_null(:string)
    field :bot,        :boolean
    field :bio,        :string
    field :phone,      :string
    field :title,      :string
    field :roles,      :roles
    field :deleted_at, :datetime
    field :creator,    :user, resolve: dataloader(Conversation)
    field :notification_preferences, :notification_preferences

    field :status, :status
    field :status_expires_at, :datetime

    field :jwt, :string, resolve: fn
      %{jwt: jwt, id: id}, _, %{context: %{current_user: %{id: id}}} ->
        {:ok, jwt}
      _, _, %{context: %{current_user: %{}}} -> {:error, "you can only view your own jwt"}
      %{jwt: jwt}, _, _ -> {:ok, jwt}
    end

    field :avatar, :string, resolve: fn
      user, _, _ -> {:ok, Core.Storage.url({user.avatar, user}, :original)}
    end

    field :export_token, :string, resolve: fn
      %{id: id}, _, %{context: %{current_user: %{id: id, roles: %{admin: true}}}} ->
        User.token("export")
      _, _, _ -> {:ok, nil}
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

  object :status do
    field :text,  non_null(:string)
    field :emoji, :string
  end

  object :roles do
    field :admin, :boolean
  end

  object :invite do
    field :id,      :id
    field :token,   :string, resolve: fn
      invite, _, _ -> Core.Services.Invites.gen_token(invite)
    end

    field :creator, :user, resolve: dataloader(User)

    timestamps()
  end

  ecto_enum :notification_type, Core.Models.Notification.Type

  object :notification do
    field :id, :id
    field :type, :notification_type
    field :user, :user, resolve: dataloader(User)
    field :actor, :user, resolve: dataloader(User)
    field :message, :message, resolve: dataloader(Conversation)
    field :workspace, :workspace, resolve: dataloader(Workspace)
    field :seen_at, :datetime

    timestamps()
  end

  object :notification_preferences do
    field :mention, :boolean
    field :message, :boolean
    field :participant, :boolean
  end

  delta :user
  delta :notification

  connection node_type: :user
  connection node_type: :notification

  object :user_queries do
    @desc "Returns yourself"
    field :me, :user do
      middleware GraphQl.Middleware.Authenticated
      resolve fn _, %{context: %{current_user: user}} -> {:ok, user} end
    end

    @desc "Get a user by id"
    field :user, :user do
      middleware GraphQl.Middleware.Authenticated
      arg :id, :id
      arg :handle, :string
      arg :email, :string
      resolve &User.resolve_user/3
    end

    @desc "Fetches a list of users in the system"
    connection field :users, node_type: :user do
      middleware GraphQl.Middleware.Authenticated
      arg :active, :boolean

      resolve &User.list_users/2
    end

    connection field :search_users, node_type: :user do
      middleware GraphQl.Middleware.Authenticated
      arg :name, non_null(:string)
      arg :active, :boolean

      resolve &User.search_users/2
    end

    field :invite, :invite do
      arg :id, non_null(:id)

      resolve &Invite.resolve_invite/2
    end

    connection field :notifications, node_type: :notification do
      middleware GraphQl.Middleware.Authenticated
      resolve &Notification.list_notifications/2
    end
  end

  object :user_mutations do
    field :create_invite, :invite do
      arg :attributes, non_null(:invite_attributes)

      resolve safe_resolver(&Invite.create_invite/2)
    end

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

    @desc "Creates a new user for this piazza instance"
    field :create_user, :user do
      middleware GraphQl.Middleware.Authenticated
      arg :attributes, non_null(:user_attributes)

      resolve safe_resolver(&User.create_user/2)
    end

    @desc "Updates the attributes on a single user"
    field :update_user, :user do
      middleware GraphQl.Middleware.Authenticated
      arg :id, non_null(:id)
      arg :attributes, non_null(:user_attributes)

      resolve safe_resolver(&User.update_user/2)
    end

    @desc "Toggles user activation"
    field :activate_user, :user do
      middleware GraphQl.Middleware.Authenticated
      arg :id,     non_null(:id)
      arg :active, :boolean

      resolve safe_resolver(&User.activate_user/2)
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

    field :view_notifications, list_of(:notification) do
      middleware GraphQl.Middleware.Authenticated
      resolve safe_resolver(&Notification.view_notifications/2)
    end
  end

  object :user_subscriptions do
    field :user_delta, :user_delta do
      config fn _args, _info -> {:ok, topic: "users"} end
    end

    field :new_notifications, :notification do
      config fn _, %{context: %{current_user: %{id: id}}} ->
        {:ok, topic: "notifications:#{id}"}
      end
    end
  end
end
