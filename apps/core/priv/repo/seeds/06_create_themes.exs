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
    link: "#383F45"
  }, "hoth", admin)

  {:ok, %{id: id}} = Brand.create_theme(%{
    brand: "#1A1D21",
    sidebar: "#1A1D21",
    sidebar_hover: "#000000",
    focus: "#0576B9",
    action: "#007a5a",
    action_hover: "#007a5a",
    focus_text: "#FFFFFF",
    active_text: "#FFFFFF",
    tag_light: "#000000",
    tag_medium: "#1A1D21",
    presence: "#39E500",
    notif: "#CC4400",
    link: "#1264a3"
  }, "piazza", admin)

  {:ok, _} = %Models.Brand{theme_id: id} |> Core.Repo.insert()
end