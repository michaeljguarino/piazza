defmodule Core.Commands.Piazza do
  use Core.Commands.Base
  alias Core.Models.User
  alias Core.Services.{Users, Conversations}

  command :piazza


  subcommand :invite do
    args ["handle"]
    doc "Adds a user as a participant to the conversation"
    handler :invite
  end
  def invite(msg, handle) do
    handle = prune_handle(handle)
    piazza_user = piazza_bot()
    with %User{id: user_id} <- Users.get_user_by_handle(handle),
         {:ok, _user} <- Conversations.create_participant(%{
                          user_id: user_id,
                          conversation_id: msg["conversation_id"]
                        }, piazza_user) do
      {:ok, "Added @#{handle} to the conversation"}
    else
      _ -> {:ok, "Couldn't find a user for @#{handle}"}
    end
  end

  subcommand :boot do
    args ["handle"]
    doc "Tosses a user from the current conversation"
    handler :boot
  end
  def boot(msg, handle) do
    handle      = prune_handle(handle)
    piazza_user = piazza_bot()
    conv_id     = msg["conversation_id"]
    with %User{id: user_id} <- Users.get_user_by_handle(handle),
         %{} <- Conversations.get_participant(user_id, conv_id),
         {:ok, _user} <- Conversations.delete_participant(conv_id, user_id, piazza_user) do
      {:ok, "Booted @#{handle} from the conversation"}
    else
      _ -> {:ok, "It doesn't look like @#{handle} is on this conversation"}
    end
  end

  defp prune_handle("@" <> handle), do: handle
  defp prune_handle(handle), do: handle

  defp piazza_bot(), do: Users.get_user_by_handle("piazza")
end