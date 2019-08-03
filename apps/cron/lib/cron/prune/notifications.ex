defmodule Cron.Prune.Notifications do
  use Cron, env: ["RETENTION_POLICY"]
  alias Core.Models.Notification

  def run(retention_policy) do
    Notification.older_than(String.to_integer(retention_policy))
    |> Core.Repo.delete_all()
    |> log_result()
  end

  def log_result({count, _}) do
    Logger.info "Pruned #{count} notifications"
    {:ok, count}
  end
end