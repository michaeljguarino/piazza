defmodule GqlWeb.Router do
  use GqlWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :auth do
    plug GqlWeb.GuardianPipeline
    plug GqlWeb.Plug.AbsintheContext
  end

  forward "/graphiql", Absinthe.Plug.GraphiQL,
      schema: Core.Schema,
      interface: :advanced

  scope "/gql" do
    pipe_through [:api, :auth]

    forward "/", Absinthe.Plug,
      schema: Core.Schema
  end

  scope "/auth", GqlWeb do
    pipe_through [:api]

    post "/login", AuthController, :login
  end

  scope "/webhook", GqlWeb do
    pipe_through [:api]

    post "/giphy", WebhookController, :giphy
  end

  scope "/", GqlWeb do
    pipe_through :browser

    get "/ping", PingController, :index
  end
end
