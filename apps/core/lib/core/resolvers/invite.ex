defmodule Core.Resolvers.Invite do
  use Core.Resolvers.Base, model: Core.Models.Invite
  alias Core.Services.Invites

  def create_invite(%{attributes: %{reference: reference, type: type}}, %{context: %{current_user: user}}),
    do: Invites.create_invite(type, reference, user)
end