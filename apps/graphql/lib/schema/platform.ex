defmodule GraphQl.Schema.Platform do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{User, Conversation, Platform}

  input_object :command_attributes do
    field :name,          non_null(:string)
    field :documentation, :string
    field :description,   :string

    field :unfurlers,        list_of(:unfurler_attributes)
    field :webhook,          non_null(:webhook_attributes)
    field :incoming_webhook, :incoming_webhook_attributes
    field :bot,              :bot_attributes
  end

  input_object :unfurler_attributes do
    field :regex, non_null(:string)
    field :value, :string
  end

  input_object :command_update_attributes do
    field :name,          :string
    field :documentation, :string
    field :description,   :string

    field :unfurlers,        list_of(:unfurler_attributes)
    field :webhook,          :webhook_attributes
    field :incoming_webhook, :incoming_webhook_attributes
  end

  input_object :webhook_attributes do
    field :url, non_null(:string)
  end

  input_object :incoming_webhook_attributes do
    field :name,     non_null(:string)
    field :routable, :boolean
  end

  input_object :bot_attributes do
    field :name,   :string
    field :email,  :string
    field :handle, :string
    field :avatar, :upload_or_url
  end

  object :dialog do
    field :structured_message, :map
    field :anchor_message, :message
    field :user, :user
  end

  object :interaction do
    field :id, non_null(:id)
    field :message, :message, resolve: dataloader(Conversation)
    field :command, :command, resolve: dataloader(Platform)

    timestamps()
  end

  object :command do
    field :id, :id
    field :name, :string
    field :documentation, :string
    field :description, :string

    field :bot, :user, resolve: dataloader(User)
    field :creator, :user, resolve: dataloader(User)
    field :webhook, :webhook, resolve: dataloader(Platform)
    field :incoming_webhook, :incoming_webhook, resolve: dataloader(Platform)
    field :unfurlers, list_of(:unfurler), resolve: dataloader(Platform)

    timestamps()
  end

  object :unfurler do
    field :id,    non_null(:id)
    field :regex, non_null(:string)
    field :value, :string

    timestamps()
  end

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

  object :installable_command do
    field :id,            :id
    field :name,          :string
    field :description,   :string
    field :documentation, :string
    field :webhook,       :string
    field :avatar,        :string
    field :regex,         :string
  end

  delta :command

  connection node_type: :command
  connection node_type: :incoming_webhook
  connection node_type: :installable_command

  object :platform_queries do
    connection field :commands, node_type: :command do
      middleware GraphQl.Middleware.Authenticated
      resolve &Platform.list_commands/2
    end

    connection field :search_commands, node_type: :command do
      middleware GraphQl.Middleware.Authenticated
      arg :name, non_null(:string)

      resolve &Platform.search_commands/2
    end

    connection field :installable_commands, node_type: :installable_command do
      middleware GraphQl.Middleware.Authenticated

      resolve &Platform.list_installable_commands/2
    end
  end

  object :platform_mutations do
    field :create_command, :command do
      middleware GraphQl.Middleware.Authenticated
      arg :attributes, non_null(:command_attributes)

      resolve safe_resolver(&Platform.create_command/2)
    end

    field :update_command, :command do
      middleware GraphQl.Middleware.Authenticated
      arg :name, non_null(:string)
      arg :attributes, non_null(:command_update_attributes)

      resolve safe_resolver(&Platform.update_command/2)
    end

    field :dispatch_interaction, :interaction do
      middleware GraphQl.Middleware.Authenticated
      arg :id, non_null(:id)
      arg :payload, non_null(:string)

      resolve safe_resolver(&Platform.dispatch_interaction/2)
    end
  end

  object :platform_subscriptions do
    field :dialog, :dialog do
      config fn _, %{context: %{current_user: user}} ->
        {:ok, topic: "dialog:#{user.id}"}
      end
    end

    field :command_delta, :command_delta do
      config fn _, _ -> {:ok, topic: "commands"} end
    end
  end
end
