defmodule Core.License.FailureHandler do
  def failed(), do: :init.stop()
end