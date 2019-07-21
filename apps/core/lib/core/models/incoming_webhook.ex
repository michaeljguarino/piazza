defmodule Core.Models.IncomingWebhook do
  use Core.DB.Schema

  alias Core.Models.{User}

  schema "incoming_webhooks" do
    field :secure_id, :string
    field :name, :string

    belongs_to :bot, User
    belongs_to :creator, User

    timestamps()
  end

  @valid ~w(secure_id name bot_id)a

  def changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @valid)
    |> validate_required([:name, :secure_id])
    |> foreign_key_constraint(:bot_id)
    |> foreign_key_constraint(:user_id)
    |> unique_constraint(:secure_id)
    |> unique_constraint(:name)
  end
end