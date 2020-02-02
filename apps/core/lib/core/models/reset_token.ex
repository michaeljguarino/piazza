defmodule Core.Models.ResetToken do
  use Piazza.Ecto.Schema
  alias Core.Models.{User}

  @entropy 64

  defenum Type, password: 0

  schema "reset_tokens" do
    field :type,      Type
    field :secure_id, :string

    belongs_to :user, User,
      foreign_key: :email,
      references: :email,
      type: :string

    timestamps()
  end

  @valid ~w(type email)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> put_new_change(:secure_id, &gen_secure_id/0)
    |> foreign_key_constraint(:email)
    |> unique_constraint(:secure_id)
    |> validate_required([:type, :email, :secure_id])
  end

  def gen_secure_id() do
    :crypto.strong_rand_bytes(@entropy)
    |> Base.url_encode64()
  end
end