defmodule Core.Models.Embed do
  use Core.DB.Schema
  import Core.Services.Base, only: [ok: 1]

  defenum Type, image: 0, video: 1, attachment: 2, other: 3

  embedded_schema do
    field :type, Type
    field :author,      :string
    field :url,         :string
    field :description, :string
    field :title,       :string
    field :height,      :integer
    field :width,       :integer
  end

  @valid ~w(type url description title height width author)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:type, :url])
  end

  def from_furlex(%Furlex{oembed: %{"url" => url, "type" => type, "height" => height, "width" => width} = attrs}) do
    %{type: type(type, url), url: url, width: width, height: height}
    |> Map.put(:title, attrs["title"])
    |> ok()
  end
  def from_furlex(%Furlex{facebook: %{"og:video" => url, "og:video:height" => height, "og:video:width" => width} = attrs}) do
    %{type: :video, width: width, height: height, url: url}
    |> Map.put(:title, attrs["og:title"])
    |> Map.put(:description, attrs["og:description"])
    |> ok()
  end
  def from_furlex(%Furlex{facebook: %{"og:image" => url, "og:image:height" => height, "og:image:width" => width} = attrs}) do
    %{type: :image, width: width, height: height, url: url}
    |> Map.put(:title, attrs["og:title"])
    |> Map.put(:description, attrs["og:description"])
    |> ok()
  end
  def from_furlex(%Furlex{facebook: %{"og:url" => url} = attrs}) do
    %{type: type(attrs["og:type"], url), url: url}
    |> Map.put(:title, attrs["og:title"])
    |> Map.put(:description, attrs["og:description"])
    |> Map.put(:author, attrs["og:site_name"])
    |> ok()
  end
  def from_furlex({:plain, url}), do: {:ok, %{type: type_from_ext(url), url: url}}
  def from_furlex(_), do: {:error, :noembed}

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