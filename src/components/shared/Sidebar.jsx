import { NavLink, useNavigate } from "react-router";
import {
  BarChart3,
  Boxes,
  ChevronLeft,
  ClipboardList,
  Gift,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  Settings2,
  ShoppingBag,
  Users,
  WalletCards,
} from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";

const links = [
  ["/", "Overview", LayoutDashboard],
  ["/orders", "Orders & bKash", ClipboardList],
  ["/products", "German Products", ShoppingBag],
  ["/pre-orders", "Import Requests", PackageSearch],
  ["/categories-brands", "Categories & Brands", Boxes],
  ["/customers", "Customers & CRM", Users],
  ["/payments-delivery", "Payments & Delivery", WalletCards],
  ["/coupons-banners", "Marketing", Gift],
  ["/reports", "Reports & Analytics", BarChart3],
  ["/settings", "Settings", Settings2],
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
    <aside className="sidebar !bg-[#ffc4c7] !text-[#2b121a] !border-r !border-[#f2b3b7]">
      <div className="brand">
        <span className="brand-mark !bg-[#2b121a] !text-white shadow-md">L</span>
        <div>
          <strong className="!text-[#2b121a] font-black">LumiHaus</strong>
          <small className="!text-[#7e2239] font-bold">Beauty commerce</small>
        </div>
      </div>
      <button className="collapse-button !bg-white !text-[#522b37] !border !border-[#f2b3b7] hover:!text-[#8f213c]" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
        <ChevronLeft size={15} />
      </button>
      <nav>
        {links.map(([to, label, Icon]) => (
          <NavLink
            title={label}
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              isActive
                ? "nav-link active !bg-white !text-[#8f213c] shadow-md shadow-[#8f213c]/10 font-black"
                : "nav-link !text-[#4a2632] hover:!text-[#1a0910] hover:!bg-white/45 font-semibold"
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={isActive ? "!text-[#8f213c] shrink-0" : "text-[#522b37] shrink-0"}
                />
                <span>{label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-4 rounded-full bg-[#8f213c] shadow-xs" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-user !border-t !border-[#e8adb1]">
        <span className="avatar !bg-white !text-[#8f213c] !border !border-[#e8adb1] font-black shadow-xs">
          SA
        </span>
        <div>
          <strong className="!text-[#2b121a] font-black">Shafin Ahmed</strong>
          <small className="!text-[#7e2239] font-bold">Super Admin</small>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out of Console"
          className="ml-auto text-[#522b37] hover:text-[#8f213c] hover:bg-white/50 p-1.5 rounded-lg transition"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

