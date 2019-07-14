defmodule Core.Models.Message do
  use Core.DB.Schema
  alias Core.Models.{User, Conversation}

  schema "messages" do
    field :text, :string

    belongs_to :creator, User
    belongs_to :conversation, Conversation

    timestamps()
  end

  @valid ~w(text)a

  def for_conversation(query \\ __MODULE__, conv_id),
    do: from(m in query, where: m.conversation_id == ^conv_id)

  def for_creator(query \\ __MODULE__, creator_id),
    do: from(m in query, where: m.creator_id == ^creator_id)

  def any(), do: from(m in __MODULE__, order_by: [desc: :inserted_at])

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:text, :creator_id, :conversation_id])
    |> foreign_key_constraint(:creator_id)
    |> foreign_key_constraint(:conversation_id)
    |> validate_length(:text, max: 255)
  end
end