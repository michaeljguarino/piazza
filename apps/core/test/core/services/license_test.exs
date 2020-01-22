defmodule Core.Services.LicenseTest do
  use Core.DataCase, async: true
  alias Core.Services.License
  alias Piazza.Crypto.License.State
  alias Piazza.Crypto.RSA

  use Mimic

  describe "#validate/2" do
    test "For nonexpired licenses it just passes state through" do
      nonexpired = conf(:license)
      pk = conf(:public_key)
      {:ok, decrypted} = RSA.decrypt(nonexpired, ExPublicKey.loads!(pk))

      state = License.validate(decrypted, %State{license: nonexpired})
      assert state.license == nonexpired
    end

    test "For expired licenses it will request a refreshed license" do
      url = "#{conf(:chartmart_url)}/auth/license"
      refreshed_license = conf(:license)

      expect(Mojito, :post, fn ^url, _, body ->
        %{"refresh_token" => _} = Jason.decode!(body)
        {:ok, %{body: Jason.encode!(%{license: refreshed_license})}}
      end)

      expired_license = conf(:expired_license)
      expired_pk = conf(:expired_pk)
      {:ok, decrypted} = RSA.decrypt(expired_license, ExPublicKey.loads!(expired_pk))

      state = License.validate(decrypted, %State{license: expired_license})
      assert state.license == refreshed_license
    end

    test "If limits are within boundaries, it will pass" do
      license = mk_license()
      insert_list(3, :user)
      %{license: "passed"} = License.validate(license, %State{license: "passed"})
    end

    test "If limits exceed boundaries, it will fail" do
      pid = self()
      insert_list(6, :user)
      expect(Core.License.FailureHandler, :failed, fn -> send pid, :failed end)

      License.validate(mk_license(), %State{license: :failed})

      assert_receive :failed
    end
  end

  defp mk_license() do
    Jason.encode!(%{
      expires_at: Timex.now() |> Timex.shift(days: 5),
      policy: %{
        limits: %{user: 5}
      }
    })
  end
  defp conf(key), do: Application.get_env(:core, key)
end