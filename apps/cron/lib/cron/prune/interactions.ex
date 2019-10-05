defmodule Cron.Prune.Interactions do
  use Cron, env: ["RETENTION_POLICY"]
  alias Core.Models.Interaction

  def run(retention_policy) do
    Interaction.older_than(String.to_integer(retention_policy))
    |> Core.Repo.delete_all()
    |> log_result()
  end

  def log_result({count, _}) do
    Logger.info "Pruned #{count} interactions"
    {:ok, count}
  end
end