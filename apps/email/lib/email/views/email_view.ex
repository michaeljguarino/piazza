defmodule Email.EmailView do
  use Email, :view

  def url(path), do: "#{base_url()}#{path}"

  defp base_url(), do: Email.conf(:host)
end