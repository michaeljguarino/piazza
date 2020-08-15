defmodule Core.Storage do
  use Arc.Definition
  use Arc.Ecto.Definition
  alias Core.Models.{
    User,
    File,
    Emoji,
    Workspace
  }

  @acl :public_read
  @versions [:original]
  @extension_whitelist ~w(.jpg .jpeg .gif .png)

  def validate({file, %User{}}) do
    file_extension = file.file_name |> Path.extname |> String.downcase
    Enum.member?(@extension_whitelist, file_extension)
  end
  def validate(_), do: true

  # def transform(:thumb, _) do
  #   {:convert, "-thumbnail 100x100^ -gravity center -extent 100x100 -format png", :png}
  # end

  def storage_dir(_, {_file, %User{avatar_id: avatar_id}}), do: "uploads/avatars/#{avatar_id}"
  def storage_dir(_, {_file, %File{object_id: obect_id}}), do: "uploads/files/#{obect_id}"
  def storage_dir(_, {_file, %Emoji{image_id: emoji_id}}), do: "uploads/emoji/#{emoji_id}"
  def storage_dir(_, {_file, %Workspace{icon_id: icon_id}}), do: "uploads/workspace/#{icon_id}"

  def default_url(_), do: nil

  def s3_object_headers(_, {_, %File{content_type: content_type}}), do: [content_type: content_type]
  def s3_object_headers(_, {file, _}), do: [content_type: MIME.from_path(file.file_name)]

  def gcs_object_headers(_, {_, %File{content_type: content_type}}), do: [contentType: content_type]
  def gcs_object_headers(_, {file, _}), do: [contentType: MIME.from_path(file.file_name)]
end