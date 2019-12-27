defmodule Core.Services.LicenseTest do
  use Core.DataCase
  alias Core.Services.License
  alias Piazza.Crypto.License.State
  alias Piazza.Crypto.RSA

  import Mock

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

      with_mock Mojito, [post: fn ^url, _, body ->
        %{"refresh_token" => _} = Jason.decode!(body)
        {:ok, %{body: Jason.encode!(%{license: refreshed_license})}}
      end] do
        expired_license = conf(:expired_license)
        expired_pk = conf(:expired_pk)
        {:ok, decrypted} = RSA.decrypt(expired_license, ExPublicKey.loads!(expired_pk))

        state = License.validate(decrypted, %State{license: expired_license})
        assert state.license == refreshed_license
      end
    end
  end

  defp conf(key), do: Application.get_env(:core, key)
end