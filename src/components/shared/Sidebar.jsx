import { NavLink, useNavigate } from "react-router";
import { BarChart3, Boxes, Building2, ChevronLeft, ClipboardList, Gift, LayoutDashboard, LogOut, PackageSearch, Settings2, ShoppingBag, Users, WalletCards } from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";

const links = [
  ["/", "Overview", LayoutDashboard], ["/orders", "Orders & bKash", ClipboardList], ["/products", "German Products", ShoppingBag],
  ["/pre-orders", "Import Requests", PackageSearch], ["/categories-brands", "Categories & Brands", Boxes], ["/customers", "Customers & CRM", Users],
  ["/payments-delivery", "Payments & Delivery", WalletCards], ["/coupons-banners", "Marketing", Gift], ["/reports-settings", "Reports & Settings", BarChart3],
];

export default function Sidebar() {
  const { collapsed, setCollapsed, notify } = useAdminUI();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("lumihaus_admin_token");
    notify("Logged out from Admin Console");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">L</span>
        <div>
          <strong>LumiHaus</strong>
          <small>Beauty commerce</small>
        </div>
      </div>
      <button className="collapse-button" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
        <ChevronLeft size={15} />
      </button>
      <nav>
        {links.map(([to, label, Icon]) => (
          <NavLink
            title={label}
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-user">
        <span className="avatar">SA</span>
        <div>
          <strong>Shafin Ahmed</strong>
          <small>Super Admin</small>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out of Console"
          className="ml-auto text-[#c7b9bf] hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
