defmodule Core.Models.StructuredMessage do
  use Core.Models.StructuredMessage.Base

  schema do
    component "box" do
      attributes ~w(direction width height pad margin align justify gap)
      parents ~w(root box attachment)
    end

    component "attachment" do
      attributes ~w(accent height width pad margin align justify gap)
      parents ~w(root)
    end

    component "text" do
      attributes ~w(size weight value color)
      parents ~w(box text attachment root link)
    end

    component "markdown" do
      attributes ~w(size weight value)
      parents ~w(box text attachment root)
    end

    component "button" do
      attributes ~w(primary label href target)
      parents ~w(box)
    end

    component "input" do
      attributes ~w(placeholder name)
      parents ~w(box)
    end

    component "image" do
      attributes ~w(width height url)
      parents ~w(box link)
    end

    component "video" do
      attributes ~w(width height url autoPlay loop)
      parents ~w(box link attachment)
    end

    component "link" do
      attributes ~w(href target value)
      parents ~w(text box attachment)
    end
  end
end