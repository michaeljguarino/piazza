defmodule Core.Models.Invite do
  use Core.DB.Schema

  alias Core.Models.User

  defenum Type, conversation: 0

  schema "invites" do
    field :type,        Type
    field :external_id, :string
    field :reference,   :binary_id

    belongs_to :creator, User

    timestamps()
  end

  def older_than(query \\ __MODULE__, date) do
    expired = DateTime.utc_now() |> Timex.shift(days: -date)
    from(m in query, where: m.inserted_at < ^expired)
  end

  @valid ~w(type reference creator_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> put_new_change(:external_id, &gen_external_id/0)
    |> validate_required([:type, :reference, :creator_id])
    |> foreign_key_constraint(:creator_id)
    |> unique_constraint(:external_id)
  end

  defp gen_external_id() do
    :crypto.strong_rand_bytes(128)
    |> Base.encode64()
  end
end