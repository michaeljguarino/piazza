defmodule Core do
  @moduledoc """
  Core keeps the contexts that define your domain and business logic.

  Contexts are also responsible for managing your data, regardless
  if it comes from the database, an external API or others.
  """

  def stringify_keys(nil), do: nil
  def stringify_keys(map = %{}) do
    Enum.into(map, %{}, fn
      {k, v} when is_atom(k) -> {Atom.to_string(k), stringify_keys(v)}
      {k, v} -> {k, stringify_keys(v)}
    end)
  end
  def stringify_keys(l) when is_list(l), do: Enum.map(l, &stringify_keys/1)
  def stringify_keys(v), do: v
end
