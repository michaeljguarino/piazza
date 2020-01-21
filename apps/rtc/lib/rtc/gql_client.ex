defmodule Rtc.GqlClient do
  use GenServer
  require Logger

  def start_link(), do: GenServer.start_link(__MODULE__, :ok, name: __MODULE__)

  def init(:ok) do
    send self(), :init
    {:ok, nil}
  end

  def handle_info(:init, _) do
    case Application.get_env(:grpc, :start_server) do
      true -> {:noreply, GRPC.Stub.connect("#{host()}:9090")}
      false -> {:noreply, {:ok, :dummy}}
    end
  end
  def handle_info(_, state), do: {:noreply, state}

  def handle_call(:chan, _, chan) do
    {:reply, chan, chan}
  end

  def chan(), do: GenServer.call(__MODULE__, :chan)

  defp host(), do: Application.get_env(:rtc, :gql_host)
end