defmodule Core.Models.Embed do
  use Piazza.Ecto.Schema
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

  def from_furlex(%Furlex{facebook: %{"og:type" => "object"} = attrs} = fr) do
    base_attrs(fr, %{type: :site})
    |> Map.put(:title, attrs["og:title"])
    |> Map.put(:description, attrs["og:description"])
    |> Map.put(:image_url, attrs["og:image"])
    |> ok()
  end
  def from_furlex(
    %Furlex{
      facebook: %{"og:video" => url, "og:video:height" => height, "og:video:width" => width} = attrs
    } = fr
  ) do
    base_attrs(fr, %{type: :video, width: width, height: height})
    |> Map.put(:title, attrs["og:title"])
    |> Map.put(:description, attrs["og:description"])
    |> Map.put(:video_url, url)
    |> ok()
  end
  def from_furlex(%Furlex{facebook: %{"og:video:url" => url} = attrs} = fr) do
    base_attrs(fr, %{type: :video, width: attrs["og:video:height"], height: attrs["og:video:width"]})
    |> Map.put(:title, attrs["og:title"])
    |> Map.put(:description, attrs["og:description"])
    |> Map.put(:video_url, url)
    |> Map.put(:video_type, video_type(attrs["og:type"], attrs["og:video:type"]))
    |> ok()
  end
  def from_furlex(%Furlex{facebook: %{"og:image" => url} = attrs} = fr) do
    base_attrs(fr, %{type: :image, width: attrs["og:image:height"], height: attrs["og:image:width"]})
    |> Map.put(:title, attrs["og:title"])
    |> Map.put(:description, attrs["og:description"])
    |> Map.put(:author, attrs["og:site_name"])
    |> Map.put(:image_url, url)
    |> ok()
  end
  def from_furlex(%Furlex{facebook: %{"og:url" => url} = attrs} = fr) do
    base_attrs(fr, %{type: type(attrs["og:type"], url)})
    |> Map.put(:title, attrs["og:title"])
    |> Map.put(:description, attrs["og:description"])
    |> Map.put(:author, attrs["og:site_name"])
    |> ok()
  end
  def from_furlex(%Furlex{twitter: attrs} = fr) do
    base_attrs(fr, %{type: :other})
    |> Map.put(:title, attrs["twitter:title"])
    |> Map.put(:description, attrs["twitter:description"])
  end
  def from_furlex({:plain, url}), do: {:ok, %{type: type_from_ext(url), url: url}}
  def from_furlex(_), do: {:error, :noembed}

  defp base_attrs(%Furlex{canonical_url: url} = fr, additional) do
    Map.merge(%{url: url}, additional)
    |> Map.merge(maybe_find_publisher(fr))
  end

  defp maybe_find_publisher(%Furlex{json_ld: [
    %{"publisher" => %{"logo" => %{"url" => url}, "name" => name}}
  ]}) do
    %{publisher: name, logo: url}
  end
  defp maybe_find_publisher(%Furlex{facebook: %{"og:site_name" => pub}}), do: %{publisher: pub}
  defp maybe_find_publisher(_), do: %{}

  defp video_type("video.other", _), do: :embed
  defp video_type(_, "text/html"), do: :embed
  defp video_type(_, _), do: :raw

  def type(type, url) do
    case Path.extname(url) do
      ".gif" -> :image
      _ -> type(type)
    end
  end

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

  def type("video" <> _), do: :video
  def type("image" <> _), do: :image
  def type("photo" <> _), do: :image
  def type(_), do: :other
end