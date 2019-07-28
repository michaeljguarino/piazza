defmodule Core.Models.Conversation do
  use Core.DB.Schema
  alias Core.Models.{Participant, Message, User}

  schema "conversations" do
    field :name,   :string
    field :public, :boolean, default: true
    field :global, :boolean, default: false
    field :topic,  :string

    has_many :participants, Participant
    has_many :messages, Message

    belongs_to :creator, User

    timestamps()
  end

  @valid ~w(name public global topic)a

  def for_user(query \\ any(), user_id) do
    from(c in query,
      left_join: p in ^Participant.for_user(user_id),
        on: p.conversation_id == c.id,
      where: c.public or not is_nil(p.id)
    )
  end

  def global(query \\ __MODULE__), do: from(c in query, where: c.global)

  def public(query \\ any()), do: from(c in query, where: c.public)

  def private(query \\ any()), do: from(c in query, where: not c.public)

  def any(), do: from(c in __MODULE__, order_by: [asc: :name])

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(c in query, order_by: ^order)

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:name, :public])
    |> validate_length(:name, max: 255)
    |> unique_constraint(:name)
  end
end