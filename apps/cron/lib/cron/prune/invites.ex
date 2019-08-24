defmodule Cron.Prune.Invites do
  use Cron, env: ["RETENTION_POLICY"]
  alias Core.Models.Invite

  def run(retention_policy) do
    Invite.older_than(String.to_integer(retention_policy))
    |> Core.Repo.delete_all()
    |> log_result()
  end

  def log_result({count, _}) do
    Logger.info "Pruned #{count} invites"
    {:ok, count}
  end
end