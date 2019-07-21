defmodule RtcWeb.ClusterController do
  use RtcWeb, :controller

  def show(conn, _params) do
    json(conn, %{nodes: [node() | Node.list()]})
  end
end
