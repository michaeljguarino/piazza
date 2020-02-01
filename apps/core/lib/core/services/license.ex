defmodule Core.Services.License do
  alias Core.Models.User
  alias Core.License
  alias Core.License.{Policy, Limits, FailureHandler}

  def fetch(), do: Piazza.Crypto.License.fetch()

  def validate(license) do
    %License{policy: policy} = decoded = License.from_json!(license)

    with {:ok, license} <- check_expiration(decoded),
         true <- check_limits(policy) do
      response(decoded, license)
    else
      _ ->
        FailureHandler.failed()
        :error
    end
  end

  def response(decoded, :pass), do: decoded
  def response(decoded, license), do: {decoded, license}

  @doc """
  Force kill the app if the license is invalid
  """
  def invalid(_), do: FailureHandler.failed()

  def check_expiration(%License{expires_at: expiry, refresh_token: token}) do
    expiry
    |> Timex.parse!("{ISO:Extended}")
    |> Timex.before?(Timex.now())
    |> case do
      true -> refetch_license(token)
      false -> {:ok, :pass}
    end
  end

  @headers [
    {"accept", "application/json"},
    {"content-type", "application/json"}
  ]

  def refetch_license(token) do
    payload = Jason.encode!(%{refresh_token: token})
    with {:ok, %{body: body}} <- Mojito.post(chartmart_url(), @headers, payload),
        %{"license" => license} <- Jason.decode!(body) do
      {:ok, license}
    else
      _ -> :error
    end
  end

  def check_limits(%Policy{free: true}), do: true
  def check_limits(%Policy{limits: %Limits{user: user_limit}}) do
    case usage(:user) do
      count when count > user_limit -> false
      _ -> true
    end
  end

  def usage(:user) do
    User.nonbot()
    |> User.active()
    |> Core.Repo.aggregate(:count, :id)
  end

  defp chartmart_url(), do: "#{Application.get_env(:core, :chartmart_url)}/auth/license"
end