defmodule Core.TestSubscriber do
  use Conduit.Subscriber

  def process(msg, _opts) do
    case Application.get_env(:core, :rtc_test_pid) do
      pid when is_pid(pid) -> send(pid, {:rtc_msg, msg})
      _ -> :ok
    end
    ack(msg)
  end
end

defmodule Core.TestBroker do
  use Aquaduct.Topology, otp_app: :core

  incoming Core do
    pipe_through [:deserialize]
    subscribe :message, TestSubscriber, from: "piazza.rtc"
  end
end