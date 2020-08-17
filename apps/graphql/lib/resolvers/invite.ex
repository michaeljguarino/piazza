defmodule GraphQl.Resolvers.Invite do
  use GraphQl.Resolvers.Base, model: Core.Models.Invite
  alias Core.Services.Invites

  def resolve_invite(%{id: external_id}, _),
    do: {:ok, Invites.get_invite(external_id)}

  def create_invite(%{attributes: %{reference: reference, type: type}}, %{context: %{current_user: user}}),
    do: Invites.create_invite(type, reference, user)
end