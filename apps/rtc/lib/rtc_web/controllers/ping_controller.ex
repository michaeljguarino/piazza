defmodule RtcWeb.PingController do
  use RtcWeb, :controller

  def index(conn, _params) do
    json(conn, %{pong: true})
  end
end
