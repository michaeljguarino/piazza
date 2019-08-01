import Botanist
import System, only: [get_env: 1]

alias Core.Repo
alias Core.Models

seed do
  piazza = Core.Services.Users.get_user_by_handle("piazza")
  {:ok, _} =
    piazza |> Ecto.Changeset.change(%{roles: %{admin: true}}) |> Core.Repo.update()

  {:ok, _} =
    Core.Services.Platform.get_command!("piazza")
    |> Ecto.Changeset.change(%{documentation: Core.Commands.Piazza.documentation()})
    |> Core.Repo.update()
end