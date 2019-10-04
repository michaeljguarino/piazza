defmodule Core.Cache do
  @moduledoc """
  Utilities for managing in-service caching via Cachex.

  Handles hashing cache among the various nodes in the cluster,
  and also things like intellgently doing read through caching
  of list queries.

  Hashing is done via a hash ring on the nodes in a cluster.  No
  replicas as stored at the moment.
  """
  @max_list_cache 1000

  @spec get(atom, binary) :: term
  def get(table, key), do: call_cache(:get, table, [key])

  @spec fetch(atom, binary, function) :: term
  def fetch(table, key, fallback),
    do: call_cache(:fetch, table, [key, fallback])

  @spec put(atom, binary, term) :: {:ok, term} | {:error, term}
  def put(table, key, value),
    do: call_cache(:put, table, [key, value])

  @spec del(atom, binary) :: {:ok, binary}
  def del(table, key),
    do: call_cache(:del, table, [key])

  @spec transaction(atom, binary, function) :: term
  def transaction(table, key, fun) do
    call_cache(:transaction, table, [[key], fun])
  end

  @doc """
  Pseudo-intelligent list caching.  Will run a count query to validate
  less than 1k elements will be returned, if so it will cache, otherwise
  it will bypass and return a stream for the given query.
  """
  @spec list_cache(Ecto.Queryable.t, atom, binary) :: term
  def list_cache(query, table, key) do
    case fetch(table, key, fn _ -> list_fallback(query) end) do
      {:ok, val} -> val
      {:commit, val} -> val
      _ -> Core.Repo.stream(query, method: :keyset)
    end
  end

  @doc """
  Fetches the result at `key`, passes it to `fun` then saves
  it back to cache at the same key
  """
  @spec refresh(term, binary, function) :: {:ok, term} | {:error, term}
  def refresh(cache, key, fun) do
    Cachex.get(cache, key)
    |> case do
      {:ok, val} -> Cachex.put(cache, key, fun.(val))
      res -> res
    end
  end

  defp list_fallback(query) do
    case Core.Repo.aggregate(query, :count, :id) do
      count when count > @max_list_cache -> {:ignore, []}
      _ -> {:commit, Core.Repo.all(query)}
    end
  end

  defp call_cache(function, table, args) do
    case Node.list() do
      [_ | _] -> call_remote(function, table, args)
      _ -> apply(Cachex, function, [table | args])
    end
  end

  defp call_remote(function, table, [k | _] = args) do
    ring = mk_ring()
    node = HashRing.key_to_node(ring, {table, hash_key(k)})

    case :rpc.call(node, Cachex, function, [table | args]) do
      {:badrpc, error} -> {:error, error}
      res -> res
    end
  end

  defp hash_key([k]), do: k
  defp hash_key(k), do: k

  defp mk_ring() do
    HashRing.new()
    |> HashRing.add_nodes([node() | Node.list()])
  end
end