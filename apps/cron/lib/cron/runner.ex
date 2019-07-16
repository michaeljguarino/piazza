defmodule Cron.Runner do
  def start_link() do
    Task.start_link(&run_cron/0)
  end

  def run_cron() do
    module = resolve_module()
    module.run()
  after
    :init.stop()
  end

  def resolve_module() do
    case System.get_env("CRON") do
      cron when is_binary(cron) -> Module.concat(Cron, cron)
      _ -> raise ArgumentError, message: "CRON env var never set"
    end
  end
end