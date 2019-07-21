import Botanist

alias Core.Repo
alias Core.Models

seed do
  admin = %Models.User{
    name: "admin",
    email: "admin@example.com",
    handle: "admin",
  } |> Models.User.changeset(%{
    password: "temporary_password",
    roles: %{admin: true}
  }) |> Repo.insert!()
  Core.Services.Conversations.create_conversation(%{name: "townhall", global: true, public: true}, admin)
end




