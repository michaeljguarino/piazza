defmodule Mix.Tasks.Gen.BearerToken do
  use Mix.Task

  @shortdoc "Generates a bearer token for a user (by email)"
  def run([email]) do
    Logger.configure(level: :warn)
    Application.ensure_all_started(:core)

    user = Core.Services.Users.get_user_by_email!(email)
    {:ok, token, _} = Core.Guardian.encode_and_sign(user)
    IO.puts "Bearer #{token}"
  end
end