defmodule Core.Schemas.InputTypes do
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
  end

  input_object :message_attributes do
    field :text, :string
  end
end