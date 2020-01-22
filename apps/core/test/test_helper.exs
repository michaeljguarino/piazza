Mimic.copy(Mojito)
Mimic.copy(Core.PiazzaRtc.Stub)
Mimic.copy(Core.License.FailureHandler)

ExUnit.start()
Ecto.Adapters.SQL.Sandbox.mode(Core.Repo, :manual)
{:ok, _} = Application.ensure_all_started(:ex_machina)
{:ok, _} = Core.Mailbox.start_link()