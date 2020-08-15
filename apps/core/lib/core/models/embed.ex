defmodule Core.Models.Embed do
  use Piazza.Ecto.Schema
  alias Core.Models.Embed.Parser
  import Core.Services.Base, only: [ok: 1]

  defenum Type, image: 0, video: 1, attachment: 2, site: 4, other: 3
  defenum VideoType, embed: 0, raw: 1

  embedded_schema do
    field :type, Type
    field :video_type,  VideoType
    field :author,      :string
    field :url,         :string
    field :image_url,   :string
    field :video_url,   :string
    field :description, :string
    field :title,       :string
    field :height,      :integer
    field :width,       :integer

    field :publisher,   :string
    field :logo,        :string
  end

  @valid ~w(type url description title height width author image_url video_url video_type publisher logo)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:type, :url])
  end

  @fields ~w(type title description publisher logo image_url video_url video_type)a

  def from_furlex(%Furlex{} = fr) do
    with {:ok, url} <- Parser.url(fr) do
      Enum.reduce(@fields, %{url: url}, fn field, attrs ->
        Map.put(attrs, field, apply(Parser, field, [fr, attrs]))
      end)
      |> ok()
    end
  end
  def from_furlex({:plain, url}), do: {:ok, %{type: type_from_ext(url), url: url}}
  def from_furlex(_), do: {:error, :noembed}

  def type_from_ext(url) do
    case Path.extname(url) do
      ".gif"  -> :image
      ".jpeg" -> :image
      ".jpg"  -> :image
      ".png"  -> :image
      ".mp4"  -> :video
      ".mp3"  -> :video
      ".webm" -> :video
      _       -> :attachment
    end
  end
end