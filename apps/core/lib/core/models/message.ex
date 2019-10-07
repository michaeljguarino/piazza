defmodule Core.Models.Message do
  use Piazza.Ecto.Schema
  use Arc.Ecto.Schema
  alias Core.Models.{
    User,
    Conversation,
    MessageEntity,
    MessageReaction,
    Embed,
    PinnedMessage,
    StructuredMessage,
    File
  }

  schema "messages" do
    field :text,               :string
    field :pinned_at,          :utc_datetime_usec
    field :structured_message, StructuredMessage.Type
    field :flattened_text,     :string
    field :reply_count,        :integer, default: 0

    belongs_to :creator,      User
    belongs_to :conversation, Conversation
    belongs_to :parent,       __MODULE__
    has_many   :entities,     MessageEntity
    has_many   :reactions,    MessageReaction
    has_one    :pin,          PinnedMessage
    has_one    :file,         File

    embeds_one :embed, Embed, on_replace: :update

    timestamps()
  end

  @valid ~w(text structured_message parent_id)a

  def for_conversation(query \\ __MODULE__, conv_id),
    do: from(m in query, where: m.conversation_id == ^conv_id)

  @tsv_query "to_tsvector('english', ?) @@ to_tsquery(?)"
  @tsv_rank "ts_rank_cd(to_tsvector('english', ?), to_tsquery(?))"

  def search(query \\ __MODULE__, search_query) do
    from(m in query,
      where: fragment(@tsv_query, m.flattened_text, ^search_query),
      order_by: [desc: fragment(@tsv_rank, m.flattened_text, ^search_query)])
  end

  def with_anchor(query \\ __MODULE__, dt, direction)
  def with_anchor(query, dt, :before),
    do: from(m in query, where: m.inserted_at < ^dt, order_by: [desc: :inserted_at])
  def with_anchor(query, dt, :after),
    do: from(m in query, where: m.inserted_at >= ^dt, order_by: [asc: :inserted_at])

  def for_creator(query \\ __MODULE__, creator_id),
    do: from(m in query, where: m.creator_id == ^creator_id)

  def any(), do: from(m in __MODULE__, order_by: [desc: :inserted_at])

  def pinned(query \\ __MODULE__), do: from(m in query, where: not is_nil(m.pinned_at))

  def unarchived(query \\ __MODULE__) do
    from(m in query,
      join: c in assoc(m, :conversation),
      where: is_nil(c.archived_at)
    )
  end

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
    |> foreign_key_constraint(:parent_id)
    |> validate_length(:text, max: 255)
    |> validate_change(:structured_message, fn _, message ->
      case StructuredMessage.validate(message) do
        :pass -> []
        {:fail, message} -> [structured_message: message]
      end
    end)
    |> flatten_text()
  end

  defp flatten_text(changeset) do
    if get_change(changeset, :text) || get_change(changeset, :structured_message) do
      text = get_field(changeset, :text)
      flattened = get_field(changeset, :structured_message) |> StructuredMessage.to_string()

      put_change(changeset, :flattened_text, "#{text} #{flattened}")
    else
      changeset
    end
  end
end