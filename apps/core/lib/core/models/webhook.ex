defmodule Core.Models.Webhook do
  use Core.DB.Schema

  schema "webhooks" do
    field :url, :string
    field :disabled, :boolean
    field :secret, :string

    timestamps()
  end

  @valid ~w(url disabled)a

  def changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @valid)
    |> validate_required([:url])
    |> validate_url(:url)
  end
end