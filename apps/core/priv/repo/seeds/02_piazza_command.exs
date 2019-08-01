import Botanist
import System, only: [get_env: 1]

alias Core.Repo
alias Core.Models

seed do
  admin = Repo.get_by!(Models.User, email: get_env("ADMIN_EMAIL"))
  Core.Services.Platform.create_command(%{
    webhook: %{url: "http://piazza-gql:4000/webhooks/piazza"},
    name: "piazza",
    bot: %{roles: %{admin: true}},
    documentation: Core.Commands.Piazza.documentation()
  }, admin)
end