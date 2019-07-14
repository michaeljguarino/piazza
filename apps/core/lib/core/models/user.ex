defmodule Core.Models.User do
  use Core.DB.Schema

  schema "users" do
    field :email,    :string
    field :name,     :string
    field :handle,   :string
    field :password, :string
    field :bio,      :string

    field :profile_img, :map

    timestamps()
  end

  @valid ~w(email name handle password)

  def ordered(query \\ __MODULE__), do: from(u in query, order_by: [asc: :email])

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:email, :name, :handle, :password])
    |> unique_constraint(:email)
    |> unique_constraint(:handle)
    |> validate_length(:email,  max: 255)
    |> validate_length(:handle, max: 255)
    |> validate_length(:name,   max: 255)
  end
end