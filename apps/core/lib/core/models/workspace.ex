defmodule Core.Models.Workspace do
  use Piazza.Ecto.Schema
  alias Core.Models.Conversation

  schema "workspaces" do
    field :name, :string
    field :description, :string

    timestamps()
  end

  @valid ~w(name description)a

  def for_user(query \\ __MODULE__, user_id) do
    conversations = Conversation.for_user(user_id)
    from(w in query,
      join: c in subquery(conversations),
        on: c.workspace_id == w.id
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