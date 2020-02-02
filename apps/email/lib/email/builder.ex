defmodule Email.Builder do
  use Bamboo.Phoenix, view: Email.EmailView

  def reset_password(token) do
    base_email()
    |> to(token.email)
    |> subject("Reset your password")
    |> assign(:token, token)
    |> render(:reset_password)
  end

  defp base_email do
    new_email()
    |> from({"Piazza notifications", "notifications@#{Email.conf(:domain)}"})
    |> put_html_layout({Email.LayoutView, "email.html"})
  end
end