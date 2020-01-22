defmodule RtcWeb.PingControllerTest do
  use RtcWeb.ConnCase, async: true

  test "GET /ping", %{conn: conn} do
    conn = get(conn, "/ping")
    assert json_response(conn, 200) == %{"pong" => true}
  end
end
