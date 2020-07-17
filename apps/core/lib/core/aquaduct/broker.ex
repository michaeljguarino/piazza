defmodule Core.Aquaduct.Broker do
  use Aquaduct.Topology, otp_app: :core

  incoming Core.Aquaduct do
    pipe_through [:in_tracking, :error_handling, :deserialize]
    subscribe :webhook, WebhookSubscriber, from: "piazza.webhook"
    subscribe :interaction, InteractionSubscriber, from: "piazza.interaction"
    subscribe :unfurl, UnfurlSubscriber, from: "piazza.unfurl"
  end
end