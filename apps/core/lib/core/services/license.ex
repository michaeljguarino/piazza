defmodule Core.Services.License do

  @doc """
  Force kill the app if the license is invalid
  """
  def invalid(_) do
    :init.stop()
  end
end