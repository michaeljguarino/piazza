defmodule Core.Services.Invites do
  use Core.Services.Base

  alias Core.Models.{Invite, User}
  alias Core.Services.Conversations
  alias Core.Invites.Token
  import Core.Policies.Invite

  def get_invite(external_id),
    do: Core.Repo.get_by(Invite, external_id: external_id)

  def create_invite(type, reference, user) do
    %Invite{creator_id: user.id}
    |> Invite.changeset(%{type: type, reference: reference})
    |> allow(user, :create)
    |> when_ok(:insert)
  end

  def realize(%Invite{type: :conversation, reference: reference} = invite, %User{id: user_id}) do
    %{creator: creator} = Core.Repo.preload(invite, [:creator])
    Conversations.create_participant(%{user_id: user_id, conversation_id: reference}, creator)
  end

  def gen_token(%Invite{external_id: ext_id}) do
    with {:ok, token, _} <- Token.generate_and_sign(%{"sub" => ext_id}),
      do: {:ok, token}
  end

  def realize_from_token(token, user) do
    with {:ok, %{"sub" => ext_id}} <- Token.verify_and_validate(token),
         %Invite{} = invite <- get_invite(ext_id),
      do: realize(invite, user)
  end
end