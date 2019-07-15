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
      interface: :simple

  scope "/gql" do
    pipe_through [:api, :auth]

    forward "/", Absinthe.Plug,
      schema: Core.Schema
  end

  scope "/", GqlWeb do
    pipe_through :browser

    get "/", PageController, :index
  end

  # Other scopes may use custom stacks.
  # scope "/api", GqlWeb do
  #   pipe_through :api
  # end
end
