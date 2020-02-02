defmodule Email.PageController do
  use Email, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
