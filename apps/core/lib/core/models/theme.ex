defmodule Core.Models.Theme do
  use Core.DB.Schema
  alias Core.Models.User

  @fields ~w(
    brand
    sidebar
    sidebar_hover
    focus
    action
    action_hover
    focus_text
    active_text
    tag_light
    tag_medium
    presence
    notif
    link
  )a

  def theme_fields(), do: @fields

  schema "themes" do
    field :name, :string

    for theme_field <- @fields,
      do: field theme_field, :string

    belongs_to :creator, User

    timestamps()
  end

  @valid [:creator_id, :name | @fields]

  def ordered(query \\ __MODULE__), do: from(t in query, order_by: [asc: :name])

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:creator_id)
    |> unique_constraint(:name)
  end
end