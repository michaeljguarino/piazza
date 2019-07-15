defmodule AquaductTest do
  use ExUnit.Case
  doctest Aquaduct

  test "greets the world" do
    assert Aquaduct.hello() == :world
  end
end
