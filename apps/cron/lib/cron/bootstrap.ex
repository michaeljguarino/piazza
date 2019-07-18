defmodule Cron.Bootstrap do
  use Cron
  alias Core.Models.User
  alias Core.Services.Conversations

  def run() do
    {:ok, admin} =
      %User{}
      |> User.changeset(%{
        name: "admin",
        handle: "admin",
        password: "admin_password",
        email: "admin@example.com",
        roles: %{admin: true}
      })
      |> Core.Repo.insert()
    Logger.info "Created temporary admin user (log in with admin@example.com, password admin_password"

    {:ok, _} = Conversations.create_conversation(%{name: "townhall", global: true, public: true}, admin)

    Logger.info "Created townhall"
  end
end