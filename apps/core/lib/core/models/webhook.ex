defmodule Core.Models.Webhook do
  use Piazza.Ecto.Schema

  schema "webhooks" do
    field :url, Piazza.Ecto.Types.URI
    field :disabled, :boolean
    field :secret, :string

    timestamps()
  end

  @valid ~w(url disabled)a

  def changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @valid)
    |> validate_required([:url])
  end
end