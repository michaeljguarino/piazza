defmodule GraphQl.Schema.Inputs do
  use Absinthe.Schema.Notation

  import_types Absinthe.Plug.Types
  import_types GraphQl.Schema.Upload

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
  end

  input_object :role_attributes do
    field :admin, :boolean
  end

  input_object :conversation_attributes do
    field :public,   :boolean
    field :name,     :string
    field :topic,    :string
    field :global,   :boolean
    field :archived, :boolean
  end

  input_object :message_attributes do
    field :text,       :string
    field :attachment, :upload
    field :parent_id,  :id
  end

  input_object :participant_attributes do
    field :conversation_id, non_null(:string)
    field :user_id, non_null(:string)
    field :notification_preferences, :notification_prefs
  end

  input_object :command_attributes do
    field :name,          non_null(:string)
    field :documentation, :string
    field :description,   :string

    field :webhook,          non_null(:webhook_attributes)
    field :incoming_webhook, :incoming_webhook_attributes
    field :bot,              :bot_attributes
  end

  input_object :command_update_attributes do
    field :name, :string
    field :documentation, :string
    field :description, :string

    field :webhook, :webhook_attributes
    field :incoming_webhook, :incoming_webhook_attributes
  end

  input_object :webhook_attributes do
    field :url, non_null(:string)
  end

  input_object :incoming_webhook_attributes do
    field :name, non_null(:string)
    field :routable, :boolean
  end

  input_object :bot_attributes do
    field :name,   :string
    field :email,  :string
    field :handle, :string
    field :avatar, :upload_or_url
  end

  input_object :notification_prefs do
    field :mention,     :boolean
    field :message,     :boolean
    field :participant, :boolean
  end

  enum :invite_type do
    value :conversation
  end

  input_object :invite_attributes do
    field :type,      :invite_type
    field :reference, non_null(:string)
  end

  input_object :emoji_attributes do
    field :image, :upload_or_url
    field :name, non_null(:string)
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

  enum :reset_token_type do
    value :password
  end

  input_object :reset_token_args do
    field :password, :string
  end
end