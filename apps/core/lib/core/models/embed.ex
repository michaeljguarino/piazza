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
    |> validate_required([:type, :url, :title])
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
  def from_furlex({:plain, url}) do
    case type_from_ext(url) do
      :image -> {:ok, %{type: :image, url: url, title: url, image_url: url}}
      :video -> {:ok, %{type: :video, url: url, title: url, video_url: url}}
      _ -> {:error, :noembed}
    end
  end
  def from_furlex(_), do: {:error, :noembed}

  defp type_from_ext(url) do
    case Path.extname(url) do
      ".gif"  -> :image
      ".jpeg" -> :image
      ".jpg"  -> :image
      ".png"  -> :image
      ".mp4"  -> :video
      ".mp3"  -> :video
      ".webm" -> :video
      _       -> :ignore
    end
  end
end