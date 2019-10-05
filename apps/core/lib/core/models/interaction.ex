defmodule Core.Models.Interaction do
  use Piazza.Ecto.Schema
  alias Core.Models.{Command, Message}

  schema "interactions" do
    field :payload, :string, virtual: true

    belongs_to :message, Message
    belongs_to :command, Command

    timestamps()
  end

  def older_than(query \\ __MODULE__, date) do
    expired = DateTime.utc_now() |> Timex.shift(days: -date)
    from(m in query, where: m.inserted_at < ^expired)
  end

  @valid ~w(message_id command_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:message_id)
    |> foreign_key_constraint(:command_id)
  end
end