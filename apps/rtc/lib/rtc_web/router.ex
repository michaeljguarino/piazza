defmodule RtcWeb.Router do
  use RtcWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", RtcWeb do
    pipe_through :api

    get "/ping", PingController, :index
  end

  get "/cluster", RtcWeb.ClusterController, :show

  forward "/graphiql", Absinthe.Plug.GraphiQL,
    schema: GraphQl,
    socket: Rtc.UserSocket

  # Other scopes may use custom stacks.
  # scope "/api", RtcWeb do
  #   pipe_through :api
  # end
end
