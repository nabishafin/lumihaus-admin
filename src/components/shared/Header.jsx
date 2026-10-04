import { useLocation } from "react-router";
import { Bell, Moon, Sun } from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";

const titles = {
  "/": "Overview",
  "/orders": "Orders & bKash",
  "/users": "Users & Admins",
  "/products": "German Products",
  "/expenses": "Expenses & Costs",
  "/bundles": "Skincare Bundles",
  "/categories-brands": "Categories & Brands",
  "/pre-orders": "Import Requests",
  "/german-ritual": "German Ritual Feed",
  "/payments-delivery": "Payments & Delivery",
  "/subscribers": "Subscribers",
  "/settings": "Settings",
};

const pageTitle = (pathname) => (pathname.startsWith("/pages/") ? "Store Pages" : titles[pathname] || "Dashboard");

export default function Header() {
  const { pathname } = useLocation();
  const { dark, setDark } = useAdminUI();

  return (
    <header className="header">
      <div>
        <p className="eyebrow">LumiHaus · Bangladesh</p>
        <h1>{pageTitle(pathname)}</h1>
      </div>

      <div className="header-actions">
        <button
          className="icon-button"
          onClick={() => setDark(!dark)}
          aria-label="Toggle color mode"
          title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          className="icon-button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}
