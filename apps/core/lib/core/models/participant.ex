defmodule Core.Models.Participant do
  use Core.DB.Schema
  alias Core.Models.{User, Conversation, NotificationPreferences}

  schema "participants" do
    belongs_to :user, User
    belongs_to :conversation, Conversation

    embeds_one :notification_preferences, NotificationPreferences, on_replace: :update

    timestamps()
  end

  @valid ~w(user_id conversation_id)a

  def for_user(query \\ __MODULE__, user_id),
    do: from(p in query, where: p.user_id == ^user_id)

  def for_conversation(query \\ __MODULE__, conv_id),
    do: from(p in query, where: p.conversation_id == ^conv_id)

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