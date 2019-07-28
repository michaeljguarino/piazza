import Botanist
import System, only: [get_env: 1]

alias Core.Repo
alias Core.Models

seed do
  admin = Repo.get_by!(Models.User, email: get_env("ADMIN_EMAIL"))
  Core.Services.Platform.create_command(%{
    webhook: %{url: "http://piazza-gql:4000/webhooks/giphy"},
    name: "giphy",
    documentation: "* /giphy _string_\nWill query the giphy API and return back a link to the gif"
  }, admin)
end
