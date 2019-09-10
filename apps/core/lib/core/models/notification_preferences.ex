defmodule Core.Models.NotificationPreferences do
  use Piazza.Ecto.Schema

  embedded_schema do
    field :mention, :boolean, default: true
    field :participant, :boolean, default: false
    field :message, :boolean, default: false
  end

  @valid ~w(mention participant message)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
  end
end