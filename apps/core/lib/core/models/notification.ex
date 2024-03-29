defmodule Core.Models.Notification do
  use Piazza.Ecto.Schema
  alias Core.Models.{User, Message, Workspace}

  defenum Type, mention: 0, message: 1

  schema "notifications" do
    field :type, Type
    field :seen_at, :utc_datetime_usec

    belongs_to :user,      User
    belongs_to :actor,     User
    belongs_to :message,   Message
    belongs_to :workspace, Workspace

    timestamps()
  end

  @valid ~w(type seen_at user_id actor_id message_id)

  def for_user(query \\ __MODULE__, user_id),
    do: from(n in query, where: n.user_id == ^user_id)

  def for_conversation(query \\ __MODULE__, conversation_id) do
    from(n in query,
      join: m in assoc(n, :message),
      where: m.conversation_id == ^conversation_id
    )
  end

  def for_workspaces(query \\ __MODULE__, workspace_ids) do
    from(n in query,
      where: n.workspace_id in ^workspace_ids)
  end

  def unseen(query \\ __MODULE__),
    do: from(n in query, where: is_nil(n.seen_at))

  def unseen_count(query \\ __MODULE__) do
    from(n in query,
      where: is_nil(n.seen_at),
      group_by: n.workspace_id,
      select: {n.workspace_id, count(n.id)}
    )
  end

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]),
    do: from(n in query, order_by: ^order)

  def older_than(query \\ __MODULE__, date) do
    expired = DateTime.utc_now() |> Timex.shift(days: -date)
    from(m in query, where: m.inserted_at < ^expired)
  end

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:type, :user_id, :actor_id, :message_id])
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:actor_id)
    |> foreign_key_constraint(:message_id)
    |> foreign_key_constraint(:workspace_id)
  end
end