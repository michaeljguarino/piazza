defmodule Core.Models.MessageEntity do
  use Core.DB.Schema
  alias Core.Models.{Message, User, Emoji}

  defenum Type, mention: 0, emoji: 1
  schema "message_entities" do
    field :type, Type
    field :start_index, :integer
    field :text, :string
    field :length, :integer

    belongs_to :message, Message
    belongs_to :user, User
    belongs_to :emoji, Emoji

    timestamps()
  end

  @valid ~w(type text start_index length message_id user_id)

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:type, :start_index, :length, :message_id, :user_id])
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:message_id)
  end
end