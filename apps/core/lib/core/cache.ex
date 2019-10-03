defmodule Core.Cache do
  @max_list_cache 1000

  def get(table, key), do: call_cache(:get, table, [key])

  def fetch(table, key, fallback),
    do: call_cache(:fetch, table, [key, fallback])

  def put(table, key, value),
    do: call_cache(:put, table, [key, value])

  def del(table, key),
    do: call_cache(:del, table, [key])

  def transaction(table, key, fun) do
    call_cache(:transaction, table, [[key], fun])
  end

  def list_cache(query, table, key) do
    case fetch(table, key, fn _ -> list_fallback(query) end) do
      {:ok, val} -> val
      {:commit, val} -> val
      _ -> Core.Repo.stream(query, method: :keyset)
    end
  end

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