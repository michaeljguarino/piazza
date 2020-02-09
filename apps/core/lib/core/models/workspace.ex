defmodule Core.Models.Workspace do
  use Piazza.Ecto.Schema

  schema "workspaces" do
    field :name, :string
    field :description, :string

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

  def ordered(query \\ __MODULE__, order \\ [asc: :name]) do
    from(w in query, order_by: ^order)
  end

  def default(), do: Application.get_env(:core, :default_workspace)

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:name)
    |> validate_required([:name])
  end
end