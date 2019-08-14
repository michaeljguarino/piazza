defmodule Core.Models.Conversation do
  use Core.DB.Schema
  alias Core.Models.{Participant, Message, User, Notification}

  schema "conversations" do
    field :name,            :string
    field :public,          :boolean, default: true
    field :global,          :boolean, default: false
    field :topic,           :string
    field :pinned_messages, :integer

    has_one  :current_participant, Participant
    has_many :participants,        Participant
    has_many :messages,            Message

    belongs_to :creator, User

    timestamps()
  end

  @valid ~w(name public global topic)a

  def for_user(query \\ any(), user_id) do
    from(c in query,
      join: p in ^Participant.for_user(user_id),
        on: p.conversation_id == c.id
    )
  end

  def accessible(query \\ any(), user_id) do
    from(c in query,
      left_join: p in ^Participant.for_user(user_id),
        on: p.conversation_id == c.id,
      where: c.public or not is_nil(p.id)
    )
  end

  def search(query \\ __MODULE__, name) do
    from(c in query,
      where: like(c.name, ^"#{name}%")
    )
  end

  def unread_message_count(query \\ __MODULE__, user_id) do
    from(c in query,
      left_join: p in ^Participant.for_user(user_id),
        on: p.conversation_id == c.id,
      join: m in assoc(c, :messages),
      where: is_nil(p.last_seen_at) or m.inserted_at > p.last_seen_at,
      group_by: c.id,
      select: {c.id, count(m.id)}
    )
  end

  def unread_notification_count(query \\ __MODULE__, user_id) do
    from(c in query,
      left_join: m in assoc(c, :messages),
      left_join: n in ^Notification.for_user(user_id),
        on: n.message_id == m.id,
      where: is_nil(n.seen_at),
      group_by: c.id,
      select: {c.id, count(n.id)})
  end

  def participant_count(query \\ __MODULE__) do
    from(c in query,
      join: p in assoc(c, :participants),
      group_by: c.id,
      select: {c.id, count(p.id)}
    )
  end

  def increment_pinned_messages(query \\ __MODULE__, inc) do
    from(c in query,
      update: [inc: [pinned_messages: ^inc]]
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