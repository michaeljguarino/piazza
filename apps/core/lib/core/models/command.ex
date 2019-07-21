defmodule Core.Models.Command do
  use Core.DB.Schema
  alias Core.Models.{User, Webhook}

  schema "commands" do
    field :name, :string
    field :documentation, :string

    belongs_to :bot, User
    belongs_to :creator, User
    belongs_to :webhook, Webhook

    timestamps()
  end

  @valid ~w(name documentation bot_id webhook_id)a

  def changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @valid)
    |> validate_required([:name, :bot_id, :webhook_id])
    |> validate_format(:name, ~r/[a-zA-Z0-9]/)
    |> foreign_key_constraint(:bot_id)
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:webhook_id)
    |> unique_constraint(:name)
  end
end