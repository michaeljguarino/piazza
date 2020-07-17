defmodule Core.Models.Unfurler do
  use Piazza.Ecto.Schema
  alias Core.Models.Command

  schema "unfurlers" do
    field :regex, :string
    field :value, :string
    field :compiled, :string, virtual: true

    belongs_to :command, Command

    timestamps()
  end

  @valid ~w(regex value)a

  def compile(%__MODULE__{regex: re, value: value} = unf) when is_binary(value) do
    String.replace(re, "{:value}", value)
    |> Regex.compile()
    |> case do
      {:ok, re} -> %{unf | compiled: re}
      _ -> unf
    end
  end
  def compile(%__MODULE__{regex: re} = unf) do
    case Regex.compile(re) do
      {:ok, re} -> %{unf | compiled: re}
      _ -> unf
    end
  end

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:regex])
  end
end