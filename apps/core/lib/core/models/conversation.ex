defmodule Core.Models.Conversation do
  use Core.DB.Schema
  alias Core.Models.{Participant, Message}

  schema "conversations" do
    field :name,   :string
    field :public, :boolean, default: true

    has_many :participants, Participant
    has_many :messages, Message
    timestamps()
  end

  @valid ~w(name public)

  def for_user(query \\ any(), user_id) do
    from(c in query,
      left_join: p in ^Participant.for_user(user_id),
        on: p.conversation_id == c.id,
      where: c.public or not is_nil(p.id)
    )
  end

  def public(query \\ any()), do: from(c in query, where: c.public)

  def private(query \\ any()), do: from(c in query, where: not c.public)

  def any(), do: from(c in __MODULE__, order_by: [asc: :name])

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:name, :public])
    |> validate_length(:name, max: 255)
  end
end