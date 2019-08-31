defmodule Core.Policies.Emoji do
  use Core.Policies.Base
  alias Core.Models.User

  def can?(%User{}, _, _), do: :pass
end