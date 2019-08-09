import Botanist
import System, only: [get_env: 1]

alias Core.Repo
alias Core.Services.Platform

seed do
  {:ok, _} =
    Platform.get_command!("piazza")
    |> Ecto.Changeset.change(%{description: "Can do basic tasks like inviting users"})
    |> Core.Repo.update()

  {:ok, _} =
    Platform.get_command!("giphy")
    |> Ecto.Changeset.change(%{description: "Sends you gifs"})
    |> Core.Repo.update()
end