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
    |> put_new_change(:secret, &gen_secret/0)
    |> validate_required([:url])
  end

  defp gen_secret() do
    :crypto.strong_rand_bytes(64)
    |> Base.url_encode64()
    |> String.replace("/", "")
  end
end