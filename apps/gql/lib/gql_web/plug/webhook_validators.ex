defmodule Gql.Plug.WebhookValidators do
  import Plug.Conn

  def validate_github(conn, _opts) do
    with %{assigns: %{raw_body: payload}} <- conn,
         [signature] = get_req_header(conn, "x-hub-signature"),
         true <- verify_signature(payload, secret(:github), signature) do
      conn
    else
      _ -> conn |> send_resp(403, "Forbidden") |> halt()
    end
  end

  defp verify_signature(payload, secret, expected) do
    signature = "sha1=" <> (:crypto.hmac(:sha, secret, payload) |> Base.encode16(case: :lower))
    Plug.Crypto.secure_compare(signature, expected)
  end

  def secret(:github),
    do: Application.get_env(:gql, :github_secret)
end