defmodule Core.Models.File do
  use Piazza.Ecto.Schema
  use Arc.Ecto.Schema

  alias Core.Models.Message

  defenum MediaType, image: 0, video: 1, audio: 2, other: 3

  schema "files" do
    field :object_id, :binary_id
    field :object, Core.Storage.Type
    field :media_type, MediaType
    field :filename, :string
    field :filesize, :integer

    belongs_to :message, Message

    timestamps()
  end

  def for_conversation(query \\ __MODULE__, conversation_id) do
    from(f in query,
      join: m in assoc(f, :message),
      where: m.conversation_id == ^conversation_id
    )
  end

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]) do
    from(f in query, order_by: ^order)
  end

  @valid ~w(message_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> generate_uuid(:object_id)
    |> cast_attachments(attrs, [:object], allow_urls: true)
    |> unique_constraint(:message_id)
    |> put_change(:filename, get_upload(attrs) |> filename())
    |> put_change(:filesize, get_upload(attrs) |> file_size())
    |> add_media_type()
    |> validate_required([:object, :filename, :media_type])
  end

  def get_upload(%{object: object}), do: object
  def get_upload(%{"object" => object}), do: object
  def get_upload(_), do: nil

  def filename(%Plug.Upload{filename: name}), do: name
  def filename(url) when is_binary(url), do: Path.basename(url)
  def filename(_), do: nil

  def media_type(name) do
    Path.extname(name)
    |> media_type_from_extname()
  end

  defp add_media_type(changeset) do
    case apply_changes(changeset) do
      %{filename: name} -> put_change(changeset, :media_type, media_type(name))
      _ -> changeset
    end
  end

  defp media_type_from_extname(".jpg"),  do: :image
  defp media_type_from_extname(".png"),  do: :image
  defp media_type_from_extname(".jpeg"), do: :image
  defp media_type_from_extname(".gif"),  do: :video
  defp media_type_from_extname(".mp4"),  do: :video
  defp media_type_from_extname(".mp3"),  do: :audio
  defp media_type_from_extname(_), do: :other

  def file_size(%Plug.Upload{path: path}) do
    case File.stat(path) do
      {:ok, %{size: size}} -> size
      _ -> nil
    end
  end
  def file_size(_), do: nil
end