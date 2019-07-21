import Botanist
import System, only: [get_env: 1]

alias Core.Repo
alias Core.Models

seed do
  admin = %Models.User{
    name: get_env("ADMIN_NAME"),
    email: get_env("ADMIN_EMAIL"),
    handle: get_env("ADMIN_HANDLE"),
  } |> Models.User.changeset(%{
    password: get_env("ADMIN_PASSWORD"),
    roles: %{admin: true}
  }) |> Repo.insert!()
  Core.Services.Conversations.create_conversation(%{name: "townhall", global: true, public: true}, admin)
end




