defmodule Gql.Giphy.Pagination do
  defstruct [:offset, :total_count, :count]
end

defmodule Gql.Giphy.Gif do
  defstruct [:url, :embed_url, :images]
end

defmodule Gql.Giphy.Image do
  defstruct [:fixed_height, :fixed_width, :fixed_height_small, :fixed_width_small, :original]
end

defmodule Gql.Giphy.ImageContent do
  defstruct [:width, :height, :mp4, :url]
end

defmodule Gql.Giphy.Response do
  alias Gql.Giphy.{Pagination, Gif, Image, ImageContent}
  defstruct [:data, :pagination]

  def decode(json) do
    Poison.decode(json, as: %__MODULE__{
      data: [%Gif{images: %Image{
        fixed_height: %ImageContent{},
        fixed_width: %ImageContent{},
        fixed_height_small: %ImageContent{},
        fixed_width_small: %ImageContent{},
        original: %ImageContent{}
      }}],
      pagination: %Pagination{}
    })
  end
end