defmodule Core.Services.ExporterTest do
  use Core.DataCase, async: true
  alias Core.Services.Exporter

  describe "#export_json" do
    test "It won't explode" do
      insert_list(10, :message)

      Exporter.export_json() |> Stream.run()
    end
  end
end