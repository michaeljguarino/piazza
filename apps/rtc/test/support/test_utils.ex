defmodule Rtc.TestUtils do
  def jwt(user) do
    {:ok, token, _} = Rtc.Guardian.encode_and_sign(user)
    "Bearer #{token}"
  end
end