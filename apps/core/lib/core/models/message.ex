defmodule Core.Models.Message do
  use Core.DB.Schema
  use Arc.Ecto.Schema
  alias Core.Models.{User, Conversation, MessageEntity, Embed}

  schema "messages" do
    field :text,          :string
    field :attachment,    Core.Storage.Type
    field :attachment_id, :binary_id

    belongs_to :creator, User
    belongs_to :conversation, Conversation
    has_many :entities, MessageEntity

    embeds_one :embed, Embed, on_replace: :update

    timestamps()
  end

  @valid ~w(text)a

  def for_conversation(query \\ __MODULE__, conv_id),
    do: from(m in query, where: m.conversation_id == ^conv_id)

  def for_creator(query \\ __MODULE__, creator_id),
    do: from(m in query, where: m.creator_id == ^creator_id)

  def any(), do: from(m in __MODULE__, order_by: [desc: :inserted_at])

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
    |> generate_uuid(:attachment_id)
    |> cast_attachments(attrs, [:attachment], allow_urls: true)
  end
end