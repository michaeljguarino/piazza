defmodule Core.Models.User do
  use Piazza.Ecto.Schema, derive_json: false
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
    field :phone,         :string
    field :title,         :string
    field :bot,           :boolean, default: false
    field :avatar_id,     :binary_id
    field :avatar,        Core.Storage.Type

    field :profile_img,   :map
    field :deleted_at,    :utc_datetime_usec
    field :status_expires_at,    :utc_datetime_usec

    embeds_one :roles, Roles, on_replace: :update do
      field :admin, :boolean, default: false
    end

    embeds_one :status, Status, on_replace: :update do
      field :emoji, :string
      field :text,  :string
    end

    embeds_one :notification_preferences, NotificationPreferences, on_replace: :update

    timestamps()
  end

  defimpl Jason.Encoder, for: __MODULE__ do
    def encode(struct, opts) do
      Piazza.Ecto.Schema.mapify(struct)
      |> Map.drop([:password, :password_hash])
      |> Jason.Encode.map(opts)
    end
  end

  @valid ~w(email name handle password bio bot phone title status_expires_at)a

  def ordered(query \\ __MODULE__, order \\ [asc: :email]), do: from(u in query, order_by: ^order)

  def nonbot(query \\ __MODULE__),
    do: from(u in query, where: not u.bot)

  def active(query \\ __MODULE__),
    do: from(u in query, where: is_nil(u.deleted_at))

  def with_handles(query \\ __MODULE__, handles) do
    from(u in query, where: u.handle in ^handles)
  end

  def with_expired_status(query \\ __MODULE__) do
    now = Timex.now()
    from(u in query, where: u.status_expires_at <= ^now)
  end

  def search(query \\ __MODULE__, handle) do
    from(u in query,
      where: like(u.handle, ^"#{handle}%")
    )
  end

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:notification_preferences)
    |> cast_embed(:status, with: &status_changeset/2)
    |> cast_embed(:roles,  with: &role_changeset/2)
    |> validate_required([:email, :name, :handle])
    |> unique_constraint(:email)
    |> unique_constraint(:handle)
    |> validate_length(:email,    max: 255)
    |> validate_length(:handle,   max: 255)
    |> validate_length(:name,     max: 255)
    |> validate_length(:password, min: 10)
    |> validate_format(:email, @email_re)
    |> generate_uuid(:avatar_id)
    |> cast_attachments(attrs, [:avatar], allow_urls: true)
    |> hash_password()
  end

  defp role_changeset(schema, params) do
    schema
    |> cast(params, [:admin])
  end

  defp status_changeset(schema, params) do
    schema
    |> cast(params, [:emoji, :text])
    |> validate_required([:text])
  end

  defp hash_password(%Ecto.Changeset{valid?: true, changes: %{password: password}} = changeset) do
    change(changeset, Argon2.add_hash(password))
  end
  defp hash_password(changeset), do: changeset
end