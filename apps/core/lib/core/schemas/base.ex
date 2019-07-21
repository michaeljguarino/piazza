defmodule Core.Schemas.Base do
  defmacro __using__(_) do
    quote do
      use Absinthe.Schema.Notation
      use Absinthe.Relay.Schema.Notation, :modern
      import Absinthe.Resolution.Helpers
      import Core.Schemas.Base
      import_types Absinthe.Type.Custom
    end
  end

  defmacro timestamps() do
    quote do
      field :inserted_at, :datetime
      field :updated_at, :datetime
    end
  end
end