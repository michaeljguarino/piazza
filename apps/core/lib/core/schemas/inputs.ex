defmodule Core.Schemas.Inputs do
  use Absinthe.Schema.Notation

  input_object :user_attributes do
    field :name,     :string
    field :email,    :string
    field :password, :string
    field :handle,   :string
    field :bio,      :string
  end

  input_object :conversation_attributes do
    field :public, :boolean
    field :name,   :string
    field :global, :boolean
  end

  input_object :message_attributes do
    field :text, :string
  end

  input_object :participant_attributes do
    field :conversation_id, non_null(:string)
    field :user_id, non_null(:string)
  end
end