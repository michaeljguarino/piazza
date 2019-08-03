defmodule Core.Models.User do
  use Core.DB.Schema
  use Arc.Ecto.Schema
  alias Core.Models.NotificationPreferences

  @email_re ~r/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-\.]+\.[a-zA-Z]{2,}$/

  schema "users" do
    field :email,         :string
    field :name,          :string
    field :handle,        :string
    field :password,      :string, virtual: true
    field :jwt,           :string, virtual: true
    field :password_hash, :string
    field :bio,           :string
    field :bot,           :boolean, default: false
    field :avatar,        Core.Storage.Type

    field :profile_img,   :map
    field :deleted_at,    :utc_datetime_usec

    embeds_one :roles, Roles, on_replace: :update do
      field :admin, :boolean, default: true
    end

    embeds_one :notification_preferences, NotificationPreferences, on_replace: :update

    timestamps()
  end

  @valid ~w(email name handle password bot)a

  def ordered(query \\ __MODULE__, order \\ [asc: :email]), do: from(u in query, order_by: ^order)

  def active(query \\ __MODULE__),
    do: from(u in query, where: is_nil(u.deleted_at))

  def with_handles(query \\ __MODULE__, handles) do
    from(u in query, where: u.handle in ^handles)
  end

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:notification_preferences)
    |> validate_required([:email, :name, :handle])
    |> unique_constraint(:email)
    |> unique_constraint(:handle)
    |> validate_length(:email,    max: 255)
    |> validate_length(:handle,   max: 255)
    |> validate_length(:name,     max: 255)
    |> validate_length(:password, min: 10)
    |> validate_format(:email, @email_re)
    |> cast_attachments(attrs, [:avatar], allow_urls: true)
    |> cast_embed(:roles, with: &role_changeset/2)
    |> hash_password()
  end

  defp role_changeset(schema, params) do
    schema
    |> cast(params, [:admin])
  end

  defp hash_password(%Ecto.Changeset{valid?: true, changes: %{password: password}} = changeset) do
    change(changeset, Argon2.add_hash(password))
  end
  defp hash_password(changeset), do: changeset
end