import Botanist

alias Core.Repo
alias Core.Services.Users

seed do
  {:ok, _} =
    Users.get_user_by_handle("giphy")
    |> Core.Models.User.changeset(%{avatar: "https://a.slack-edge.com/7f1a0/plugins/giphy/assets/service_192.png"})
    |> Core.Repo.update()
end