defmodule Core.Models.User do
  use Core.DB.Schema

  @email_re ~r/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-\.]+\.[a-zA-Z]{2,}$/

  schema "users" do
    field :email,         :string
    field :name,          :string
    field :handle,        :string
    field :password,      :string, virtual: true
    field :password_hash, :string
    field :bio,           :string

    field :profile_img, :map

    timestamps()
  end

  @valid ~w(email name handle password)a

  def ordered(query \\ __MODULE__), do: from(u in query, order_by: [asc: :email])

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:email, :name, :handle])
    |> unique_constraint(:email)
    |> unique_constraint(:handle)
    |> validate_length(:email,  max: 255)
    |> validate_length(:handle, max: 255)
    |> validate_length(:name,   max: 255)
    |> validate_length(:password, min: 10)
    |> validate_format(:email, @email_re)
    |> hash_password()
  end

  defp hash_password(%Ecto.Changeset{valid?: true, changes: %{password: password}} = changeset) do
    change(changeset, Argon2.add_hash(password))
  end
  defp hash_password(changeset), do: changeset
end