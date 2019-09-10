defmodule Core.Policies.User do
  use Piazza.Policy
  alias Core.Models.User

  def can?(%User{roles: %{admin: true}}, _, _), do: :pass
  def can?(%User{}, %User{bot: true}, _), do: :pass
  def can?(%User{id: id}, %User{id: id}, :update), do: :continue
  def can?(_, %Ecto.Changeset{changes: %{roles: _}}, _),
    do: {:error, "Only admins can modify roles"}
  def can?(user, %Ecto.Changeset{} = cs, action), do: can?(user, apply_changes(cs), action)
  def can?(_, _, :update), do: {:error, "A user can only update themself"}

  def can?(_, _, _), do: {:error, "Forbidden"}
end