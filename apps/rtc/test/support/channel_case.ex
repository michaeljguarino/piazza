defmodule RtcWeb.ChannelCase do
  @moduledoc """
  This module defines the test case to be used by
  channel tests.

  Such tests rely on `Phoenix.ChannelTest` and also
  import other functionality to make it easier
  to build common data structures and query the data layer.

  Finally, if the test case interacts with the database,
  it cannot be async. For this reason, every test runs
  inside a transaction which is reset at the beginning
  of the test unless the test case is marked as async.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      # Import conveniences for testing with channels
      use Phoenix.ChannelTest
      use Absinthe.Phoenix.SubscriptionTest, schema: Core.Schema
      import Core.Factory
      import RtcWeb.ChannelCase
      import Rtc.TestUtils

      # The default endpoint for testing
      @endpoint RtcWeb.Endpoint

      def establish_socket(user) do
        {:ok, socket} = mk_socket(user)
        Absinthe.Phoenix.SubscriptionTest.join_absinthe(socket)
      end

      def mk_socket(user) do
        connect(RtcWeb.UserSocket, %{"token" => Rtc.TestUtils.jwt(user)}, %{})
      end
    end
  end

  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Core.Repo)

    unless tags[:async] do
      Ecto.Adapters.SQL.Sandbox.mode(Core.Repo, {:shared, self()})
    end

    :ok
  end

  def publish_event(event), do: Rtc.Aquaduct.Subscriber.publish_event(event)
end
