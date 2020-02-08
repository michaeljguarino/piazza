defmodule Core.Policies.Workspace do
  use Piazza.Policy
  alias Core.Models.{User, Workspace}

  def can?(%User{roles: %{admin: true}}, _, _), do: :pass
  def can?(_, _, _), do: {:error, :forbidden}
end