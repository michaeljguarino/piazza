defmodule Cron.Prune.Messages do
  use Cron, env: ["RETENTION_POLICY"]
  alias Core.Models.Message

  def run(retention_policy) do
    Message.unarchived()
    |> Message.older_than(String.to_integer(retention_policy))
    |> Core.Repo.delete_all()
    |> log_result()
  end

  def log_result({count, _}) do
    Logger.info "Pruned #{count} messages"
    {:ok, count}
  end
end