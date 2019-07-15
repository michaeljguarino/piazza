defmodule Core.Schema do
  use Absinthe.Schema
  use Absinthe.Relay.Schema, :modern
  import Core.Schemas.Helpers

  alias Core.Resolvers.{Conversation, User}
  import_types Core.Schemas.Types
  import_types Core.Schemas.Inputs

  def context(ctx) do
    loader =
      Dataloader.new()
      |> Dataloader.add_source(Conversation, Conversation.data(ctx))
      |> Dataloader.add_source(User, User.data(ctx))

    Map.put(ctx, :loader, loader)
  end

  def plugins do
    [Absinthe.Middleware.Dataloader] ++ Absinthe.Plugin.defaults()
  end

  # NB: I'll need to break this up somehow soon
  query do
    @desc "Get a user by id"
    field :user, :user do
      arg :id, type: non_null(:id)
      resolve &User.resolve_user/3
    end

    @desc "Fetches a list of users in the system"
    connection field :users, node_type: :user do
      resolve &User.list_users/2
    end

    @desc "Fetches a list of public or private conversations, don't attempt to preload participants or messages plz"
    connection field :conversations, node_type: :conversation do
      arg :public, non_null(:boolean)
      resolve &Conversation.list_conversations/2
    end

    @desc "Fetches an individual conversation"
    field :conversation, :conversation do
      arg :id, non_null(:id)
      resolve &Conversation.resolve_conversation/3
    end
  end

  mutation do
    @desc "Creates a new user for this piazza instance"
    field :create_user, :user do
      arg :attributes, non_null(:user_attributes)

      resolve safe_resolver(&User.create_user/2)
    end

    @desc "Updates the attributes on a single user"
    field :update_user, :user do
      arg :id, non_null(:id)
      arg :attributes, non_null(:user_attributes)

      resolve safe_resolver(&User.update_user/2)
    end

    @desc "Creates a new conversation"
    field :create_conversation, :conversation do
      arg :attributes, non_null(:conversation_attributes)

      resolve safe_resolver(&Conversation.create_conversation/2)
    end

    @desc "Updates a conversation by id"
    field :update_conversation, :conversation do
      arg :id, non_null(:id)
      arg :attributes, non_null(:conversation_attributes)

      resolve safe_resolver(&Conversation.update_conversation/2)
    end

    @desc "Creates a message in a conversation"
    field :create_message, :message do
      arg :conversation_id, non_null(:id)
      arg :attributes, non_null(:message_attributes)

      resolve safe_resolver(&Conversation.create_message/2)
    end

    field :create_participant, :participant do
      arg :attributes, non_null(:participant_attributes)

      resolve safe_resolver(&Conversation.create_participant/2)
    end

    field :delete_participant, :participant do
      arg :conversation_id, non_null(:id)
      arg :user_id, non_null(:id)

      resolve safe_resolver(&Conversation.delete_participant/2)
    end
  end

  subscription do
    field :new_users, :user do
      config fn _args, _info -> {:ok, topic: "users"} end
    end

    field :updated_users, :user do
      arg :id, non_null(:id)
      config fn %{id: id}, _info -> {:ok, topic: "users:#{id}"} end
    end

    field :new_conversations, :conversation do
      config fn _args, _info -> {:ok, topic: "conversations"} end
    end

    field :updated_conversations, :conversation do
      config fn _args, _info -> {:ok, topic: "conversations:updated"} end
    end

    field :deleted_conversations, :conversation do
      config fn _args, _info -> {:ok, topic: "conversations:deleted"} end
    end

    field :new_participants, :participant do
      arg :conversation_id, non_null(:id)
      config fn %{id: id}, _info -> {:ok, topic: "participants:#{id}"} end
    end

    field :deleted_participants, :participant do
      arg :conversation_id, non_null(:id)
      config fn %{id: id}, _info -> {:ok, topic: "participants:#{id}"} end
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