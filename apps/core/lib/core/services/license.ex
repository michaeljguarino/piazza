defmodule Core.Services.License do
  def validate(license, state) do
    %{"expires_at" => expiry, "refresh_token" => token} =
      Jason.decode!(license)

    expiry
    |> Timex.parse!("{ISO:Extended}")
    |> Timex.before?(Timex.now())
    |> case do
      true -> %{state | license: refetch_license(token)}
      false -> state
    end
  end

  @doc """
  Force kill the app if the license is invalid
  """
  def invalid(_) do
    :init.stop()
  end

  @headers [
    {"accept", "application/json"},
    {"content-type", "application/json"}
  ]

  def refetch_license(token) do
    payload = Jason.encode!(%{refresh_token: token})
    with {:ok, %{body: body}} <- Mojito.post(chartmart_url(), @headers, payload)
                                 |> IO.inspect(),
        %{"license" => license} <- Jason.decode!(body) do
      license
    else
      _ -> :init.stop()
    end
  end

  defp chartmart_url(), do: Application.get_env(:core, :chartmart_url)
end