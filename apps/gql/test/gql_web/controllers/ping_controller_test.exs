defmodule GqlWeb.PingControllerTest do
  use GqlWeb.ConnCase, async: true

  test "GET /ping", %{conn: conn} do
    conn = get(conn, "/ping")
    assert json_response(conn, 200) == %{"pong" => true}
  end
end
