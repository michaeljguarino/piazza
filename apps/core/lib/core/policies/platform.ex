defmodule Core.Policies.Platform do
  use Core.Policies.Base
  alias Core.Models.User

  def can?(%User{}, _, _), do: :pass
end