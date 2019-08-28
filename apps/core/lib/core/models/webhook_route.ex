defmodule Core.Models.WebhookRoute do
  use Core.DB.Schema
  alias Core.Models.{Conversation, IncomingWebhook}

  schema "webhook_routes" do
    field :route_key, :string

    belongs_to :incoming_webhook, IncomingWebhook
    belongs_to :conversation, Conversation

    timestamps()
  end

  @valid ~w(route_key incoming_webhook_id conversation_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:route_key, :incoming_webhook_id, :conversation_id])
    |> foreign_key_constraint(:conversation_id)
    |> foreign_key_constraint(:incoming_webhook_id)
    |> unique_constraint(:route_key, name: index_name(:webhook_routes, [:incoming_webhook_id, :route_key]))
  end
end