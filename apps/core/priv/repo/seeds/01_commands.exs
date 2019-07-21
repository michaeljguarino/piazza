import Botanist

alias Core.Repo
alias Core.Models

seed do
  admin = Repo.get_by(Models.User, name: "admin")
  Core.Services.Platform.create_command(%{
    webhook: %{url: "http://piazza-gql/webhooks/giphy"},
    name: "giphy"
  }, admin)
end
