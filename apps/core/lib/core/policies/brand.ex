defmodule Core.Policies.Brand do
  use Piazza.Policy
  alias Core.Models.{Brand, User}

  def can?(%User{roles: %{admin: true}}, %Brand{}, :update), do: :pass
  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)
  def can?(_, _, :update), do: {:error, "Only admins can update branding"}
end