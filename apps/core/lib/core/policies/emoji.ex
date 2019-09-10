defmodule Core.Policies.Emoji do
  use Piazza.Policy
  alias Core.Models.User

  def can?(%User{}, _, _), do: :pass
end