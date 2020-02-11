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
    schema: GraphQl,
    interface: :advanced,
    document_providers: [GraphQl.APQ, Absinthe.Plug.DocumentProvider.Default]

  scope "/gql" do
    pipe_through [:api, :auth]

    forward "/", Absinthe.Plug,
      schema: GraphQl,
      document_providers: [GraphQl.APQ, Absinthe.Plug.DocumentProvider.Default]
  end

  scope "/auth", GqlWeb do
    pipe_through [:api]

    post "/login", AuthController, :login
  end

  scope "/webhooks", GqlWeb do
    pipe_through [:api]

    post "/giphy", WebhookController, :giphy
    post "/giphy/interaction", WebhookController, :giphy_interaction
    post "/piazza", WebhookController, :piazza
    post "/github", WebhookController, :github
  end

  scope "/external", GqlWeb do
    pipe_through [:api]

    post "/incoming_webhooks/:secure_id", IncomingWebhookController, :dispatch
    post "/slack/incoming_webhooks/:secure_id", IncomingWebhookController, :slack_dispatch
    post "/webhooks/github", ExternalWebhookController, :github

    scope "/export" do
      get "/json", ExportController, :json
      get "/participants", ExportController, :participants
    end
  end

  scope "/", GqlWeb do
    pipe_through :api

    get "/ping", PingController, :index
  end
end
