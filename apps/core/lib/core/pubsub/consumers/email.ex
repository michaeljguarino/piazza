defmodule Core.PubSub.Consumers.Email do
  @moduledoc """
  Delivers emails for eligible event types
  """
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 20

  def handle_event(event) do
    with %Bamboo.Email{} = email <- Core.PubSub.Email.construct(event) |> IO.inspect(),
      do: Email.Mailer.deliver_now(email)
  end
end