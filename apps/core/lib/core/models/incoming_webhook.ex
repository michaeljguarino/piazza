defmodule Core.Models.IncomingWebhook do
  use Core.DB.Schema

  alias Core.Models.{User, Conversation, Command}

  schema "incoming_webhooks" do
    field :secure_id, :string
    field :name, :string

    belongs_to :bot, User
    belongs_to :creator, User
    belongs_to :conversation, Conversation
    belongs_to :command, Command

    timestamps()
  end

  @valid ~w(secure_id name bot_id conversation_id)a

  def changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @valid)
    |> put_new_change(:secure_id, &gen_secure_id/0)
    |> validate_required([:name, :secure_id])
    |> foreign_key_constraint(:bot_id)
    |> foreign_key_constraint(:user_id)
    |> unique_constraint(:secure_id)
    |> unique_constraint(:name)
  end

  defp gen_secure_id() do
    :crypto.strong_rand_bytes(32)
    |> Base.encode64()
    |> String.replace("/", "")
  end
end