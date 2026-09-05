import { useLocation } from "react-router";
import { Bell, Moon, Sun } from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";

const titles = {
  "/": "Overview",
  "/products": "German Products",
  "/pre-orders": "Import Requests",
  "/categories-brands": "Categories & Brands",
  "/orders": "Orders & bKash",
  "/customers": "Customers & CRM",
  "/payments-delivery": "Payments & Delivery",
  "/coupons-banners": "Marketing",
  "/reports-settings": "Reports & Settings",
};

export default function Header() {
  const { pathname } = useLocation();
  const { dark, setDark } = useAdminUI();

  return (
    <header className="header">
      <div>
        <p className="eyebrow">LumiHaus · Bangladesh</p>
        <h1>{titles[pathname] || "Dashboard"}</h1>
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
          <span className="notification-dot" />
        </button>
      </div>
    </header>
  );
}
