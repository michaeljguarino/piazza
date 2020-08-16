defmodule Core.Models.Embed.Parser do
  def url(%Furlex{canonical_url: url, facebook: fb, twitter: tw, json_ld: ld})
    when map_size(fb) > 0 or map_size(tw) > 0 or length(ld) > 0, do: {:ok, url}
  def url(_), do: {:error, :unsupported}

  def type(%Furlex{facebook: %{"og:video:url" => _}}, _), do: :video
  def type(%Furlex{facebook: %{"og:image" => _}}, _), do: :image
  def type(%Furlex{facebook: %{"og:type" => "object"}}, _), do: :site
  def type(%Furlex{facebook: %{"og:type" => type} = fb}), do: fb_type(type, fb["og:url"])
  def type(_), do: :other

  def title(%Furlex{facebook: %{"og:title" => title}}, _), do: title
  def title(%Furlex{twitter: %{"twitter:title" => title}}, _), do: title
  def title(%Furlex{json_ld: [%{"name" => name} | _]}, _), do: name
  def title(_, _), do: nil

  def description(%Furlex{facebook: %{"og:description" => desc}}, _), do: desc
  def description(%Furlex{twitter: %{"twitter:description" => desc}}, _), do: desc
  def description(%Furlex{json_ld: [%{"headline" => desc}]}, _), do: desc
  def description(_, _), do: nil

  def image_url(%Furlex{facebook: %{"og:image" => im}}, %{url: url}), do: localize(im, url)
  def image_url(%Furlex{twitter: %{"twitter:image" => im}}, %{url: url}), do: localize(im, url)
  def image_url(%Furlex{json_ld: [%{"image" => %{"url" => im}} | _]}, %{url: url}), do: localize(im, url)
  def image_url(_, _), do: nil


  def video_url(%Furlex{facebook: %{"og:video:url" => vid}}, %{url: url}), do: localize(vid, url)
  def video_url(_, _), do: nil

  def video_type(%Furlex{facebook: attrs}, %{type: :video}), do: __video_type(attrs["og:type"], attrs["og:video:type"])
  def video_type(_, _), do: nil

  def publisher(%Furlex{facebook: %{"og:site_name" => pub}}, _), do: pub
  def publisher(%Furlex{json_ld: [%{"publisher" => %{"name" => pub}} | _]}, _), do: pub
  def publisher(%Furlex{json_ld: [%{"@graph" => [%{"publisher" => %{"name" => pub}} | _]} | _]}, _), do: pub
  def publisher(_, _), do: nil

  def logo(%Furlex{json_ld: [%{"publisher" => %{"logo" => %{"url" => url}}} | _]}, _), do: url
  def logo(%Furlex{json_ld: [%{"@graph" => [%{"publisher" => %{"logo" => %{"url" => url}}} | _]} | _]}, _), do: url
  def logo(_, _), do: nil

  def width(%Furlex{facebook: %{"og:image:width" => w}}, %{type: :image}), do: w
  def width(%Furlex{facebook: %{"og:video:width" => w}}, %{type: :video}), do: w
  def width(_, _), do: nil

  def height(%Furlex{facebook: %{"og:image:height" => h}}, %{type: :image}), do: h
  def height(%Furlex{facebook: %{"og:video:height" => h}}, %{type: :video}), do: h
  def height(_, _), do: nil

  defp __video_type("video.other", _), do: :embed
  defp __video_type(_, "text/html"), do: :embed
  defp __video_type(_, _), do: :raw

  defp fb_type("video" <> _, _), do: :video
  defp fb_type("image" <> _, _), do: :image
  defp fb_type("photo" <> _, _), do: :image
  defp fb_type(_, url) do
    case Path.extname(url) do
      ".gif" -> :image
      _ -> :other
    end
  end

  defp localize("/" <> _ = path, url) do
    %URI{} = uri = URI.parse(url)
    URI.merge(%{uri | path: "/", query: nil}, path)
    |> to_string()
  end
  defp localize(url, _), do: url
end