defmodule Core.Repo do
  use Ecto.Repo,
    otp_app: :core,
    adapter: Ecto.Adapters.Postgres
  use Bourne

  def increment(%{__struct__: struct, id: id}, field, amount \\ 1) do
    struct.for_id(id)
    |> struct.selected()
    |> update_all(inc: [{field, amount}])
    |> case do
      {1, [schema]} -> {:ok, schema}
      _ -> {:error, :not_found}
    end
  end
end
