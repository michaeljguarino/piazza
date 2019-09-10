defmodule Core.Models.PinnedMessage do
  use Piazza.Ecto.Schema
  alias Core.Models.{User, Conversation, Message}

  schema "pinned_messages" do
    belongs_to :user,         User
    belongs_to :message,      Message
    belongs_to :conversation, Conversation

    timestamps()
  end

  @valid ~w(user_id message_id conversation_id)a

  def for_conversation(query \\ __MODULE__, conversation_id),
    do: from(pm in query, where: pm.conversation_id == ^conversation_id)

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]),
    do: from(pm in query, order_by: ^order)

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:message_id)
    |> foreign_key_constraint(:conversation_id)
    |> unique_constraint(:message_id, name: :pinned_messages_message_id_conversation_id_index)
    |> validate_required([:message_id, :conversation_id, :user_id])
  end
end