defmodule Core.Models.StructuredMessageTest do
  use Core.DataCase, async: true
  alias Core.Models.StructuredMessage

  describe "#validate" do
    test "It will validate nested structures" do
      :pass = StructuredMessage.validate(%{
        "_type" => "root",
        "children" => [
          %{"_type" => "attachment", "children" => [
            %{"_type" => "box", "children" => [%{"_type" => "text", "value" => "some text"}]}
          ]},
          %{"_type" => "box", "children" => [
            %{"_type" => "button", "attributes" => %{"primary" => true, "label" => "go"}}
          ]}
        ]
      })
    end

    test "It will validate parentage" do
      {:fail, _} = StructuredMessage.validate(%{
        "_type" => "root",
        "children" => [
          %{"_type" => "button", "attributes" => %{"label" => "go"}}
        ]
      })
    end

    test "It will validate attributes" do
      {:fail, _} = StructuredMessage.validate(%{
        "_type" => "root",
        "children" => [%{"_type" => "box", "attributes" => %{"bogus" => "attribute"}}]
      })
    end
  end
end