defmodule Core.Models.Message do
  use Core.DB.Schema
  use Arc.Ecto.Schema
  alias Core.Models.{
    User,
    Conversation,
    MessageEntity,
    MessageReaction,
    Embed,
    PinnedMessage
  }

  schema "messages" do
    field :text,               :string
    field :attachment,         Core.Storage.Type
    field :attachment_id,      :binary_id
    field :pinned_at,          :utc_datetime_usec
    field :structured_message, :map

    belongs_to :creator,      User
    belongs_to :conversation, Conversation
    has_many   :entities,     MessageEntity
    has_many   :reactions,    MessageReaction
    has_one    :pin,          PinnedMessage

    embeds_one :embed, Embed, on_replace: :update

    timestamps()
  end

  @valid ~w(text structured_message)a

  def for_conversation(query \\ __MODULE__, conv_id),
    do: from(m in query, where: m.conversation_id == ^conv_id)

  def search(query \\ __MODULE__, search_query) do
    from(m in query,
      where: fragment("to_tsvector('english', ?) @@ to_tsquery(?)", m.text, ^search_query),
      order_by: [desc: fragment("ts_rank_cd(to_tsvector('english', ?), to_tsquery(?))", m.text, ^search_query)])
  end

  def for_creator(query \\ __MODULE__, creator_id),
    do: from(m in query, where: m.creator_id == ^creator_id)

  def any(), do: from(m in __MODULE__, order_by: [desc: :inserted_at])

  def pinned(query \\ __MODULE__), do: from(m in query, where: not is_nil(m.pinned_at))

  def unarchived(query \\ __MODULE__), do: query # haven't implemented archival yet

  @seconds_in_day 60 * 60 * 24

  def older_than(query \\ __MODULE__, date) do
    expired =
      DateTime.utc_now()
      |> DateTime.add(-(date * @seconds_in_day), :second)
    from(m in query, where: m.inserted_at < ^expired)
  end

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]),
    do: from(m in query, order_by: ^order)

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:embed)
    |> validate_required([:text, :creator_id, :conversation_id])
    |> foreign_key_constraint(:creator_id)
    |> foreign_key_constraint(:conversation_id)
    |> validate_length(:text, max: 255)
    |> validate_change(:structured_message, fn _, message ->
      case Core.Models.StructuredMessage.validate(message) do
        :pass -> []
        {:fail, message} -> [structured_message: message]
      end
    end)
    |> generate_uuid(:attachment_id)
    |> cast_attachments(attrs, [:attachment], allow_urls: true)
  end
end