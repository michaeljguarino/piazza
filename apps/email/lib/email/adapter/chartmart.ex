defmodule Email.Adapter.Chartmart do
  @moduledoc """
  Bamboo adapter for sending emails using chartmart's email
  proxy endpoint.

  Requires a valid license with an embedded license token to
  use.
  """
  @behaviour Bamboo.Adapter

  @headers [
    {"accept", "application/json"},
    {"content-type", "application/json"}
  ]

  @fields ~w(to from subject html_body text_body)a

  @spec deliver(Bamboo.Email.t, term) :: {:ok, term} | {:error, term}
  def deliver(email, _) do
    chartmart_url()
    |> Mojito.post(
      [{"authorization", "Bearer #{token()}"} | @headers],
      Jason.encode!(convert(email))
    )
  end

  def handle_config(conf), do: conf

  def supports_attachments?(), do: false

  def convert(%Bamboo.Email{to: to, from: from} = email) do
    map = Map.from_struct(email) |> Map.take(@fields)
    %{map | to: to_address(to), from: to_address(from)}
  end

  defp to_address([addr | _]), do: to_address(addr)
  defp to_address({nil, address}), do: %{email: address}
  defp to_address({"", address}), do: %{email: address}
  defp to_address({name, address}), do: %{email: address, name: name}
  defp to_address(addr) when is_binary(addr), do: %{email: addr}

  defp chartmart_url(),
    do: "#{Application.get_env(:core, :chartmart_url)}/api/email"

  defp token() do
    %{refresh_token: token} = Piazza.Crypto.License.fetch()
    token
  end
end