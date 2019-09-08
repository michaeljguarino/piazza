defmodule Core.Models.InstallableCommand do
  use Core.DB.Schema

  schema "installable_commands" do
    field :name,          :string
    field :description,   :string
    field :documentation, :string
    field :avatar,        :string
    field :webhook,       :string

    timestamps()
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(ic in query, order_by: ^order)

  @valid ~w(name description documentation avatar)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:name, :description, :documentation, :avatar])
    |> unique_constraint(:name)
  end
end