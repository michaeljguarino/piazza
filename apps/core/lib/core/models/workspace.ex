defmodule Core.Models.Workspace do
  use Piazza.Ecto.Schema
  use Arc.Ecto.Schema

  schema "workspaces" do
    field :name,        :string
    field :description, :string
    field :icon,        Core.Storage.Type
    field :icon_id,     :binary_id

    timestamps()
  end

  @valid ~w(name description)a

  def for_user(query \\ __MODULE__, user_id) do
    from(w in query,
      where: fragment("""
        exists(
          select p.id
          from conversations c, participants p
          where c.id = p.conversation_id
            and p.user_id = ? and c.workspace_id = ?)
      """, type(^user_id, :binary_id), w.id)
    )
  end

  def first(query \\ __MODULE__) do
    from(w in query, limit: 1)
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]) do
    from(w in query, order_by: ^order)
  end

  def default(), do: Application.get_env(:core, :default_workspace)

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> generate_uuid(:icon_id)
    |> unique_constraint(:name)
    |> validate_required([:name])
    |> cast_attachments(attrs, [:icon], allow_urls: true)
  end
end