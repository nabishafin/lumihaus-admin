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
    <aside className="sidebar !bg-[#26382E] !text-[#F9F6EF] !border-r !border-[#1a2820]">
      {/* Brand */}
      <div className="brand">
        <span className="brand-mark !bg-[#8FAF9A] !text-[#26382E] shadow-md !text-2xl !w-11 !h-11 !rounded-xl">L</span>
        <div>
          <strong className="!text-[#F9F6EF] font-black !text-xl">LumiHaus</strong>
          <small className="!text-[#8FAF9A] font-semibold !text-sm">Beauty commerce</small>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        className="collapse-button !bg-[#1a2820] !text-[#8FAF9A] !border !border-[#3a5045] hover:!text-[#F9F6EF] hover:!bg-[#3a5045]"
        onClick={() => setCollapsed(!collapsed)}
        aria-label="Toggle sidebar"
      >
        <ChevronLeft size={17} />
      </button>

      {/* Nav Links */}
      <nav>
        {links.map(([to, label, Icon]) => (
          <NavLink
            title={label}
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              isActive
                ? "nav-link active !bg-[#8FAF9A]/20 !text-[#8FAF9A] !shadow-none !font-bold !border-l-[3px] !border-[#8FAF9A] !text-[15px] !py-3"
                : "nav-link !text-[#F9F6EF]/70 hover:!text-[#F9F6EF] hover:!bg-white/10 !font-medium !text-[15px] !py-3"
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  className={isActive ? "!text-[#8FAF9A] shrink-0" : "!text-[#F9F6EF]/60 shrink-0"}
                />
                <span className="!text-[15px]">{label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-5 rounded-full bg-[#8FAF9A]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-user !border-t !border-[#3a5045]">
        <span className="avatar !bg-[#8FAF9A] !text-[#26382E] !border !border-[#3a5045] font-black shadow-xs !text-base !w-10 !h-10">
          SA
        </span>
        <div>
          <strong className="!text-[#F9F6EF] font-bold !text-base">Shafin Ahmed</strong>
          <small className="!text-[#8FAF9A] font-semibold !text-sm">Super Admin</small>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out of Console"
          className="ml-auto !text-[#F9F6EF]/60 hover:!text-[#8FAF9A] hover:!bg-white/10 p-1.5 rounded-lg transition"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
