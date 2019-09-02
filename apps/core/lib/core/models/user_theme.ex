defmodule Core.Models.UserTheme do
  use Core.DB.Schema
  alias Core.Models.{Theme, User}

  schema "user_themes" do
    belongs_to :theme, Theme
    belongs_to :user, User

    timestamps()
  end

  @valid ~w(theme_id user_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:theme_id)
    |> unique_constraint(:user_id)
    |> validate_required([:theme_id, :user_id])
  end
end