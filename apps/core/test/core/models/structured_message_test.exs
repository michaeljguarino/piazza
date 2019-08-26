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

  describe "#from_xml" do
    test "It can convert an xml representation to the canonical map form" do
      document = """
        <root>
          <attachment gap="small" pad="small">
            <text size="small">some text</text>
            <link href="http://some.link">link value</link>
          </attachment>
        </root>
      """

      {:ok, result} = StructuredMessage.from_xml(document)

      assert result["_type"] == "root"
      [%{"_type" => "attachment", "children" => [first, second]}] = result["children"]

      assert first["_type"] == "text"
      assert first["attributes"]["value"] == "some text"

      assert second["_type"] == "link"
      assert second["attributes"]["href"] == "http://some.link"
      assert second["attributes"]["value"] == "link value"
    end
  end
end