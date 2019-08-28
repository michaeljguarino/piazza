defmodule GqlWeb.Router do
  use GqlWeb, :router

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

  scope "/webhooks", GqlWeb do
    pipe_through [:api]

    post "/giphy", WebhookController, :giphy
    post "/piazza", WebhookController, :piazza
  end

  scope "/external", GqlWeb do
    pipe_through [:api]

    post  "/incoming_webhooks/:secure_id", IncomingWebhookController, :dispatch
    post "/webhooks/github", ExternalWebhookController, :github
  end

  scope "/", GqlWeb do
    pipe_through :api

    get "/ping", PingController, :index
  end
end
