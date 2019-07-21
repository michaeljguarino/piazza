defmodule Core.Mailbox do
  @moduledoc """
  Collects events during test
  """
  use GenServer

  def start_link(),
    do: GenServer.start_link(__MODULE__, :ok, name: __MODULE__)

  def init(:ok) do
    {:ok, MapSet.new()}
  end

  def register(server \\ __MODULE__, pid \\ self()),
    do: GenServer.call(server, {:register, pid})

  def deregister(server \\ __MODULE__, pid \\ self()),
    do: GenServer.call(server, {:deregister, pid})

  def broadcast(server \\ __MODULE__, event),
    do: GenServer.cast(server, {:broadcast, event})

  def handle_cast({:broadcast, event}, pids) do
    for pid <- pids, do: send(pid, {:event, event})
    {:noreply, pids}
  end

  def handle_call({:register, pid}, _from, pids), do: {:reply, :ok, MapSet.put(pids, pid)}

  def handle_call({:deregister, pid}, _from, pids),  do: {:reply, :ok, MapSet.delete(pids, pid)}
end