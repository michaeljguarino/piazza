defmodule GqlWeb.GuardianPipeline do
  use Guardian.Plug.Pipeline, otp_app: :gql,
                              module: Gql.Guardian,
                              error_handler: GqlWeb.Plug.AuthErrorHandler

  plug Guardian.Plug.VerifySession
  plug Guardian.Plug.VerifyHeader, realm: "Bearer"
  plug Guardian.Plug.EnsureAuthenticated
  plug Guardian.Plug.LoadResource
end