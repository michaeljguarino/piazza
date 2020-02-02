defmodule Email.Adapter.ChartmartTest do
  use ExUnit.Case, async: true
  use Mimic
  alias Email.Adapter.Chartmart

  describe "deliver/2" do
    test "It will post the jsonified email to chartmart" do
      chartmart_url = "#{Application.get_env(:core, :chartmart_url)}/api/email"
      email = %Bamboo.Email{to: "someone", from: "else", text_body: "text"}
      jsonified = Chartmart.convert(email) |> Jason.encode!()
      expect(Mojito, :post, fn ^chartmart_url, _, ^jsonified -> :ok end)

      :ok = Email.Adapter.Chartmart.deliver(email, [])
    end
  end
end