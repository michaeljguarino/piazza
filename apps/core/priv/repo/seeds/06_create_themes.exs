import Botanist
alias Core.Services.Brand
alias Core.Models

seed do
  admin = Core.Repo.get_by!(Models.User, email: System.get_env("ADMIN_EMAIL"))
  {:ok, _} = Brand.create_theme(%{
    brand: "#2D9EE0",
    sidebar: "#F8F8FA",
    sidebar_hover: "#FFFFFF",
    focus: "#2D9EE0",
    action: "#2D9EE0",
    action_hover: "#298eca",
    focus_text: "#383F45",
    active_text: "#FFFFFF",
    tag_light: "#F8F8FA",
    tag_medium: "#FFFFFF",
    presence: "#60D156",
    notif: "#DC5960",
    link: "#2D9EE0"
  }, "hoth", admin)

  {:ok, %{id: id}} = Brand.create_theme(%{
    brand: "#2F415B",
    sidebar: "#2F415B",
    sidebar_hover: "#263449",
    focus: "#CF6D57",
    action: "#2F415B",
    action_hover: "#2a3b52",
    focus_text: "#FFFFFF",
    active_text: "#FFFFFF",
    tag_light: "#6d7a8c",
    tag_medium: "#59677c",
    presence: "#006633",
    notif: "#EB4D5C",
    link: "#2F415B"
  }, "piazza", admin)

  {:ok, _} = %Models.Brand{theme_id: id} |> Core.Repo.insert()
end