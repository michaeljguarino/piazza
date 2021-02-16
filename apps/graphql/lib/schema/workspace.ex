defmodule GraphQl.Schema.Workspace do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{User, Brand, Emoji, Plan, Workspace}

  input_object :workspace_attributes do
    field :name,        :string
    field :description, :string
    field :icon,        :upload_or_url
  end

  input_object :emoji_attributes do
    field :image,    :upload_or_url
    field :name,     non_null(:string)
    field :fullname, :string
  end

  input_object :theme_attributes do
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
  end

  input_object :brand_attributes do
    field :theme_id, :id
  end

  object :workspace do
    field :id,          non_null(:id)
    field :name,        non_null(:string)
    field :description, :string

    field :unread_notifications, :integer do
      resolve fn workspace, _, %{context: %{loader: loader, current_user: user}} ->
        manual_dataloader(
          loader, Workspace, {:one, Core.Models.Workspace}, unread_notifications: {user, workspace})
      end
    end

    field :icon, :string, resolve: fn
      workspace, _, _ -> {:ok, Core.Storage.url({workspace.icon, workspace}, :original)}
    end

    timestamps()
  end

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

  object :brand do
    field :id,       non_null(:id)
    field :theme_id, non_null(:id)
    field :theme,    :theme, resolve: fn brand, _, context -> Brand.get_theme(brand, context) end

    timestamps()
  end

  object :theme do
    field :id,   :id
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

  object :plan_details do
    field :license, :license
    field :usage, :usage
  end

  object :usage do
    field :user, :integer
  end

  object :license do
    field :limits,   :limits
    field :features, list_of(:feature)
    field :plan,     :string
  end

  object :limits do
    field :user, :integer
  end

  object :feature do
    field :name, :string
    field :description, :string
  end

  delta :emoji

  connection node_type: :workspace
  connection node_type: :theme
  connection node_type: :emoji

  object :workspace_queries do
    connection field :workspaces, node_type: :workspace do
      middleware GraphQl.Middleware.Authenticated

      resolve &Workspace.list_workspaces/2
    end

    connection field :emoji, node_type: :emoji do
      middleware GraphQl.Middleware.Authenticated
      resolve &Emoji.list_emoji/2
    end

    field :brand, :brand do
      resolve safe_resolver(&Brand.resolve_brand/2)
    end

    field :plan, :plan_details do
      middleware GraphQl.Middleware.Authenticated
      resolve safe_resolver(&Plan.resolve_plan/2)
    end

    connection field :themes, node_type: :theme do
      middleware GraphQl.Middleware.Authenticated

      resolve &Brand.list_themes/2
    end
  end

  object :workspace_mutations do
    field :create_workspace, :workspace do
      arg :attributes, non_null(:workspace_attributes)

      resolve safe_resolver(&Workspace.create_workspace/2)
    end

    field :update_workspace, :workspace do
      arg :attributes, non_null(:workspace_attributes)
      arg :id, non_null(:id)

      resolve safe_resolver(&Workspace.update_workspace/2)
    end

    field :create_emoji, :emoji do
      middleware GraphQl.Middleware.Authenticated
      arg :attributes, non_null(:emoji_attributes)

      resolve safe_resolver(&Emoji.create_emoji/2)
    end

    field :create_theme, :theme do
      middleware GraphQl.Middleware.Authenticated
      arg :name, non_null(:string)
      arg :attributes, non_null(:theme_attributes)

      resolve safe_resolver(&Brand.create_theme/2)
    end

    field :set_theme, :theme do
      middleware GraphQl.Middleware.Authenticated
      arg :id, non_null(:id)

      resolve safe_resolver(&Brand.set_theme/2)
    end

    field :update_brand, :brand do
      middleware GraphQl.Middleware.Authenticated
      arg :attributes, non_null(:brand_attributes)

      resolve safe_resolver(&Brand.update_brand/2)
    end
  end

  object :workspace_subscriptions do
    field :emoji_delta, :emoji_delta do
      config fn _, _ -> {:ok, topic: "emoji"} end
    end
  end
end
