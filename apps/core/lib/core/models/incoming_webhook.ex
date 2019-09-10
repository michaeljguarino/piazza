defmodule Core.Models.IncomingWebhook do
  use Piazza.Ecto.Schema

  alias Core.Models.{User, Conversation, Command}

  schema "incoming_webhooks" do
    field :secure_id, :string
    field :name, :string
    field :routable, :boolean, default: false

    belongs_to :bot, User
    belongs_to :creator, User
    belongs_to :conversation, Conversation
    belongs_to :command, Command

    timestamps()
  end

  @valid ~w(secure_id name bot_id conversation_id routable)a

  def changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @valid)
    |> put_new_change(:secure_id, &gen_secure_id/0)
    |> validate_required([:name, :secure_id])
    |> foreign_key_constraint(:bot_id)
    |> foreign_key_constraint(:user_id)
    |> unique_constraint(:secure_id)
    |> unique_constraint(:name)
    |> unique_constraint(:command_id)
  end

  defp gen_secure_id() do
    :crypto.strong_rand_bytes(32)
    |> Base.url_encode64()
    |> String.replace("/", "")
  end
end