defmodule Core.Models.FileTest do
  use Core.DataCase, async: true
  alias Core.Models.File

  describe "#changeset/2" do
    @tag :skip
    test "It can extract image width/height" do
      path = Path.join(:code.priv_dir(:core), "terraform-diagram.png")
      upload = %Plug.Upload{path: path, filename: "terraform-diagram.png"}
      message = insert(:message)

      {:ok, file} =
        %File{message_id: message.id}
        |> File.changeset(%{object: upload})
        |> Core.Repo.insert()

      assert file.width == 2880
    end
  end
end