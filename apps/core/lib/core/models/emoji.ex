defmodule Core.Models.Emoji do
  use Core.DB.Schema
  use Arc.Ecto.Schema

  schema "emoji" do
    field :name, :string
    field :fullname, :string
    field :image, Core.Storage.Type
    field :image_id, :binary_id

    belongs_to :creator, Core.Models.User

    timestamps()
  end

  @valid ~w(name fullname creator_id)a

  def with_names(query \\ __MODULE__, names),
    do: from(e in query, where: e.name in ^names)

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(q in query, order_by: ^order)

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> generate_uuid(:image_id)
    |> cast_attachments(attrs, [:image], allow_urls: true)
    |> unique_constraint(:name)
    |> foreign_key_constraint(:creator_id)
    |> validate_required([:name, :image])
  end
end