defmodule Core.Models.Participant do
  use Piazza.Ecto.Schema
  alias Core.Models.{User, Conversation, NotificationPreferences}

  schema "participants" do
    field :last_seen_at, :utc_datetime_usec
    field :deleted_at, :utc_datetime_usec

    belongs_to :user, User
    belongs_to :conversation, Conversation

    embeds_one :notification_preferences, NotificationPreferences, on_replace: :update

    timestamps()
  end

  @valid ~w(user_id conversation_id last_seen_at)a

  def for_user(query \\ __MODULE__, user_id),
    do: from(p in query, where: p.user_id == ^user_id and is_nil(p.deleted_at))

  def for_conversation(query \\ __MODULE__, conv_id),
    do: from(p in query, where: p.conversation_id == ^conv_id)

  def for_conversations(query \\ __MODULE__, conv_ids),
    do: from(p in query, where: p.conversation_id in ^conv_ids)

  def ignore_users(query \\ __MODULE__, user_ids),
    do: from(p in query, where: p.user_id not in ^user_ids)

  def preload(query \\ __MODULE__, preloads),
    do: from(p in query, preload: ^preloads)

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:notification_preferences)
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:conversation_id)
    |> unique_constraint(:user_id, name: :participants_user_id_conversation_id_index)
  end
end