defmodule Core.License.Policy do
  defstruct [:limits, :free, :features]
end

defmodule Core.License.Limits do
  defstruct [:user]
end

defmodule Core.License do
  alias Core.License.{Policy, Limits}
  defstruct [:expires_at, :refresh_token, :policy]

  def from_json!(json) do
    Poison.decode!(json, as: %__MODULE__{policy: %Policy{limits: %Limits{}}})
  end
end