defmodule Core.Services.ExporterTest do
  use Core.DataCase, async: true
  alias Core.Services.Exporter

  describe "#export_json" do
    test "It won't explode" do
      insert_list(10, :message)

      Exporter.export_json() |> Stream.run()
    end
  end

  describe "#export_participants" do
    test "It won't explode" do
      insert_list(5, :participant)

      Exporter.export_participants() |> Stream.run()
    end
  end
end