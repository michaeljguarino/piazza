# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Core.Repo.insert!(%Core.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.
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




