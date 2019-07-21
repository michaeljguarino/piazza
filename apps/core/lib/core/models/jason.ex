defimpl Jason.Encoder, for: Core.Models.User.Roles do
  def encode(struct, opts) do
    Core.DB.Schema.mapify(struct)
    |> Jason.Encode.map(opts)
  end
end
