defmodule Core.Policies.User do
  use Core.Policies.Base
  alias Core.Models.User

  def can?(%User{id: id}, %User{id: id}, :update), do: :continue
  def can?(_, _, :update), do: {:error, "A user can only update themself"}

  def can?(_, _, _), do: {:error, "Forbidden"}
end