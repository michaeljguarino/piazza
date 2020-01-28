defmodule GqlWeb.ExportController do
  use GqlWeb, :controller
  alias Core.Services.Exporter
  alias Core.Exporter.Token

  plug :validate_jwt, [type: "export"]

  def json(conn, _) do
    conn
    |> put_resp_header("content-disposition", "attachment; filename=workspace.json.gz")
    |> put_resp_content_type("application/gzip")
    |> send_chunked(200)
    |> send_stream(Exporter.export_json())
  end

  def participants(conn, _) do
    conn
    |> put_resp_header("content-disposition", "attachment; filename=participants.csv.gz")
    |> put_resp_content_type("application/gzip")
    |> send_chunked(200)
    |> send_stream(Exporter.export_participants())
  end

  defp validate_jwt(%{params: %{"token" => token}} = conn, opts) do
    expected = Keyword.get(opts, :type)
    case Token.verify_and_validate(token) do
      {:ok, %{"type" => ^expected}} -> conn
      _ -> GqlWeb.FallbackController.call(conn, {:error, :forbidden}) |> halt()
    end
  end

  defp send_stream(conn, stream) do
    Enum.reduce_while(stream, conn, fn data, conn ->
      case chunk(conn, data) do
        {:ok, conn} -> {:cont, conn}
        {:error, :closed} -> {:halt, conn}
      end
    end)
  end
end