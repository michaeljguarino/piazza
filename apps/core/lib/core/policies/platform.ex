defmodule Core.Policies.Platform do
  use Core.Policies.Base
  alias Core.Models.{User, IncomingWebhook}

  def can?(%User{} = user, %IncomingWebhook{} = incoming, action) do
    %{conversation: conversation} = Core.Repo.preload(incoming, [:conversation])
    Core.Policies.Conversation.can?(user, conversation, action)
  end
  def can?(%User{}, _, _), do: :pass

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)
end