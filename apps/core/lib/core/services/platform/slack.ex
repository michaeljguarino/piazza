defmodule Core.Services.Platform.Slack do
  @moduledoc """
  Maintains compatibility between slack message format and piazza's.  Still WIP
  """
  import Core.Services.Platform.Slack.Mkdwn

  def translate(%{"blocks" => blocks}) when is_list(blocks) do
    children = Enum.map(blocks, &do_translate/1) |> Enum.filter(& &1)
    {:structured, Core.stringify_keys(%{_type: "root", children: children})}
  end
  def translate(%{"attachments" => attachments}) when is_list(attachments) do
    children = Enum.map(attachments, &attachment/1) |> Enum.filter(& &1)
    {:structured, Core.stringify_keys(%{_type: "root", children: children})}
  end
  def translate(%{"text" => text}), do: {:plain, to_markdown(text)}
  def translate(_), do: {:error, :invalid_argument}

  defp do_translate(%{"type" => "section", "text" => %{"text" => text}} = section) do
    %{
      _type: "box",
      attributes: %{pad: "small", direction: "row", gap: "small"},
      children: [
        %{
          _type: "box",
          attributes: %{fill: "horizontal"},
          children: [%{_type: "markdown", attributes: %{}, value: to_markdown(text)}]
        } | accessory(section)]
    }
  end

  defp do_translate(%{"type" => "context", "elements" => elems}) when is_list(elems),
    do: %{_type: "box", attributes: %{color: "light-6"}, children: Enum.map(elems, &do_translate/1)}

  defp do_translate(%{"type" => text_type, "text" => text}) when text_type in ~w(text plain_text mkdwn),
    do: %{_type: "markdown", attributes: %{}, value: to_markdown(text)}

  defp do_translate(%{"type" => "image", "image_url" => img} = image) do
    %{
      _type: "box",
      children: Enum.filter([
        do_translate(image["title"]),
        %{_type: "image", attributes: %{url: img}}
      ], & &1)
    }
  end

  defp do_translate(%{"type" => "button", "text" => %{"text" => text}} = button) do
    %{_type: "button", attributes: %{href: button["url"], label: text}}
  end

  defp do_translate(_), do: nil

  defp attachment(%{"color" => color, "text" => text}) do
    %{
      _type: "attachment",
      attributes: %{accent: color, pad: "small", margin: %{top: "xsmall"}},
      children: [
        %{_type: "markdown", attributes: %{value: to_markdown(text)}}
      ]
    }
  end

  defp accessory(%{"accessory" => item}),
    do: [%{_type: "box", attributes: %{width: "30%"}, children: [do_translate(item)]}]
  defp accessory(_), do: []
end