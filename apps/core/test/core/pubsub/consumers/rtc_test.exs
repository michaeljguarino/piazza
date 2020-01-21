defmodule Core.PubSub.Consumers.RtcTest do
  use Core.DataCase
  alias Core.PubSub

  describe "ConversationCreated" do
    test "It will publish the event to the rtc queue" do
      Application.put_env(:core, :rtc_test_pid, self())
      {:ok, pid} = Core.TestBroker.start_link()
      conversation = insert(:conversation)

      event = %PubSub.ConversationCreated{item: conversation}
      Core.PubSub.Consumers.Rtc.handle_event(event)

      assert_receive {:rtc_msg, %{body: ^event}}

      Process.exit(pid, :normal)
    end
  end
end