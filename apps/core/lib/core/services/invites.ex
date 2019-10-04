defmodule Core.Services.Invites do
  use Core.Services.Base

  alias Core.Models.{Invite, User}
  alias Core.Services.Conversations
  import Core.Policies.Invite

  @spec get_invite(binary) :: Invite.t | nil
  def get_invite(external_id),
    do: Core.Repo.get_by(Invite, external_id: external_id)

  @doc """
  Creates a new invite record for use in invite links.

  allowed roles for `:conversation`:
  * participant
  """
  @spec create_invite(atom | binary, binary, User.t) :: {:ok, Invite.t} | error
  def create_invite(type, reference, user) do
    %Invite{creator_id: user.id}
    |> Invite.changeset(%{type: type, reference: reference})
    |> allow(user, :create)
    |> when_ok(:insert)
  end

  @doc """
  Actualizes the invite.  Currently we only support :conversation invites,
  which simply adds the user as a participant.

  Fails if the creator of the invite can no longer perform the implied action
  """
  @spec realize(Invite.t, User.t) :: {:ok, Participant.t} | error
  def realize(%Invite{type: :conversation, reference: reference} = invite, %User{id: user_id}) do
    %{creator: creator} = Core.Repo.preload(invite, [:creator])
    Conversations.create_participant(%{user_id: user_id, conversation_id: reference}, creator)
  end

  @doc "Token for this invite"
  @spec gen_token(Invite.t) :: {:ok, binary}
  def gen_token(%Invite{external_id: ext_id}), do: {:ok, ext_id}

  @doc """
  Fetches an invite by it's secure token, then realizes
  """
  @spec realize_from_token(binary, User.t) :: {:ok, Participant.t} | error
  def realize_from_token(token, user) do
    with %Invite{} = invite <- get_invite(token),
      do: realize(invite, user)
  end
end