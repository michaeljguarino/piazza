defmodule Core.Models.MessageReaction do
  use Core.DB.Schema
  alias Core.Models.{User, Message}

  schema "message_reactions" do
    field :name, :string
    belongs_to :message, Message
    belongs_to :user, User

    timestamps()
  end

  @valid ~w(name message_id user_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:name, :message_id, :user_id])
    |> foreign_key_constraint(:message_id)
    |> foreign_key_constraint(:user_id)
    |> unique_constraint(:name, name: :message_reactions_name_message_id_user_id_index)
  end
end