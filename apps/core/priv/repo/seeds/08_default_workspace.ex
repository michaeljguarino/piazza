import Botanist
alias Core.Models.{Conversation}

seed do
  id = Core.Services.Workspaces.default_id()

  Core.Repo.update_all(Conversation, set: [workspace_id: id])
end