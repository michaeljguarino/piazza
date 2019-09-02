defmodule Core.Models.Brand do
  use Core.DB.Schema
  alias Core.Models.Theme

  schema "brand" do
    belongs_to :theme, Theme

    timestamps()
  end

  def first(), do: from(b in __MODULE__, limit: 1)

  @valid ~w(theme_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:theme_id])
  end
end