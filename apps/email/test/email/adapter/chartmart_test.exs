defmodule Email.Adapter.ForgeTest do
  use ExUnit.Case, async: true
  use Mimic
  alias Email.Adapter.Forge

  describe "deliver/2" do
    test "It will post the jsonified email to forge" do
      forge_url = "#{Application.get_env(:core, :forge_url)}/api/email"
      email = %Bamboo.Email{to: "someone", from: "else", text_body: "text"}
      jsonified = Forge.convert(email) |> Jason.encode!()
      expect(Mojito, :post, fn ^forge_url, _, ^jsonified -> :ok end)

      :ok = Email.Adapter.Forge.deliver(email, [])
    end
  end
end