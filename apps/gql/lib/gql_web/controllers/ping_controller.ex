defmodule GqlWeb.PingController do
  use GqlWeb, :controller

  def index(conn, _params) do
    json(conn, %{pong: true})
  end
end
