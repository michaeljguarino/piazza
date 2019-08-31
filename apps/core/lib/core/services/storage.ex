defmodule Core.Storage do
  use Arc.Definition
  use Arc.Ecto.Definition
  alias Core.Models.{User, Message, Emoji}

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

  def storage_dir(_, {_file, %User{id: user_id}}), do: "uploads/avatars/#{user_id}"
  def storage_dir(_, {_file, %Message{attachment_id: msg_id}}), do: "uploads/attachments/#{msg_id}"
  def storage_dir(_, {_file, %Emoji{image_id: emoji_id}}), do: "uploads/emoji/#{emoji_id}"

  def default_url(_), do: nil
end