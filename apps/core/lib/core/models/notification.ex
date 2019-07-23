defmodule Core.Models.Notification do
  use Core.DB.Schema
  alias Core.Models.{User, Message}

  defenum Type, mention: 0, message: 1

  schema "notifications" do
    field :type, Type
    field :seen_at, :utc_datetime_usec

    belongs_to :user,  User
    belongs_to :actor, User
    belongs_to :message, Message

    timestamps()
  end

  @valid ~w(type seen_at user_id actor_id message_id)

  def for_user(query \\ __MODULE__, user_id),
    do: from(n in query, where: n.user_id == ^user_id)

  def unseen(query \\ __MODULE__),
    do: from(n in query, where: is_nil(n.seen_at))

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]),
    do: from(n in query, order_by: ^order)

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:type, :user_id, :actor_id, :message_id])
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:actor_id)
    |> foreign_key_constraint(:message_id)
  end
end