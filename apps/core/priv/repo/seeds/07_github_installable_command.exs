import Botanist
import Core.Commands.Base, only: [command_record: 4]
alias Core.Commands.Github
alias Core.Services.Platform

seed do
  {:ok, _} =
    command_record(
      Github, 
      "Notifies you of things going on in your repos",
      "http://piazza-gql:4000/webhooks/github",
      "https://storage.googleapis.com/piazzaapp-uploads/uploads/avatars/06c16162-db11-408f-a8e1-1cff537ca99c/github_transparent.png"
    )
    |> Platform.create_installable_command()
end