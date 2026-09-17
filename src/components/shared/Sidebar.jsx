import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slice/authSlice";
import { baseApi } from "../../redux/base/baseApi";
import {
  Award,
  BookOpen,
  Boxes,
  Camera,
  ChevronDown,
  ChevronLeft,
  ClipboardList,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Mail,
  PackageSearch,
  Receipt,
  RefreshCw,
  Scale,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  WalletCards,
} from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";

const mainLinks = [
  ["/", "Overview", LayoutDashboard],
  ["/orders", "Orders & bKash", ClipboardList],
  ["/products", "German Products", ShoppingBag],
  ["/expenses", "Expenses & Costs", Receipt],
  ["/bundles", "Skincare Bundles", Sparkles],
  ["/categories-brands", "Categories & Brands", Boxes],
  ["/pre-orders", "Import Requests", PackageSearch],
  ["/german-ritual", "German Ritual Feed", Camera],
  ["/payments-delivery", "Payments & Delivery", WalletCards],
  ["/subscribers", "Subscribers", Mail],
];

const storePageLinks = [
  ["/pages/about-us", "About Us", BookOpen],
  ["/pages/terms", "Terms & Conditions", Scale],
  ["/pages/privacy", "Privacy Policy", ShieldCheck],
  ["/pages/refund", "Return & Refund", RefreshCw],
  ["/pages/shipping", "Shipping & Delivery", Truck],
  ["/pages/authenticity", "Authenticity Guarantee", Award],
  ["/pages/faq", "FAQ", HelpCircle],
];

const systemLinks = [
  ["/settings", "Settings", Settings2],
];

export default function Sidebar() {
  const { collapsed, setCollapsed, notify } = useAdminUI();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const isStorePageActive =
    location.pathname.startsWith("/pages") || location.pathname === "/store-pages";
  const [pagesOpen, setPagesOpen] = useState(isStorePageActive);

  // Keep dropdown open when navigating into store pages
  useEffect(() => {
    if (isStorePageActive) {
      setPagesOpen(true);
    }
  }, [isStorePageActive]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(baseApi.util.resetApiState());
    if (typeof window !== "undefined") {
      localStorage.removeItem("lumihaus_admin_token");
      localStorage.removeItem("admin_token");
      localStorage.removeItem("token");
      localStorage.removeItem("lumihaus_admin_user");
    }
    notify("Logged out from Admin Console");
    navigate("/login");
  };

  const renderLink = ([to, label, Icon], isExact = false) => (
    <NavLink
      title={label}
      key={to}
      to={to}
      end={isExact}
      className={({ isActive }) =>
        isActive
          ? "nav-link active !bg-[#F9F6EF] !text-[#26382E] !shadow-sm !font-bold !text-[13.5px] !py-2.5 rounded-xl transition-all"
          : "nav-link !text-[#F9F6EF]/75 hover:!text-[#F9F6EF] hover:!bg-white/10 !font-medium !text-[13.5px] !py-2.5 rounded-xl transition-all"
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={18}
            className={isActive ? "!text-[#26382E] shrink-0" : "!text-[#F9F6EF]/65 shrink-0"}
          />
          <span className={`!text-[13.5px] truncate ${isActive ? "!text-[#26382E] !font-bold" : ""}`}>
            {label}
          </span>
          {isActive && (
            <span className="ml-auto w-1.5 h-4 rounded-full bg-[#26382E] shrink-0" />
          )}
        </>
      )}
    </NavLink>
  );

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
      <nav className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1 custom-scroll">
        {/* Main Operations */}
        <div className="space-y-0.5">
          {mainLinks.map((item) => renderLink(item, item[0] === "/"))}
        </div>

        {/* Store Pages Dropdown Accordion */}
        <div className="pt-2 border-t border-[#3a5045]/60">
          <button
            type="button"
            onClick={() => {
              if (collapsed) setCollapsed(false);
              setPagesOpen((prev) => !prev);
            }}
            title="Store Pages (7 pages)"
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition cursor-pointer text-left ${
              isStorePageActive
                ? "bg-white/12 text-[#F9F6EF] font-bold border border-white/20"
                : "text-[#F9F6EF]/75 hover:text-[#F9F6EF] hover:bg-white/10 font-medium"
            }`}
          >
            <FileText
              size={18}
              className={isStorePageActive ? "text-[#F9F6EF] shrink-0" : "text-[#F9F6EF]/60 shrink-0"}
            />
            <span className="text-[13.5px] truncate flex-1">Store Pages</span>

            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 transition ${
                isStorePageActive
                  ? "bg-[#F9F6EF] text-[#26382E]"
                  : "bg-white/15 text-[#F9F6EF]/80"
              }`}
            >
              7
            </span>

            <ChevronDown
              size={15}
              className={`shrink-0 transition-transform duration-200 ${
                isStorePageActive ? "text-[#F9F6EF]" : "text-[#F9F6EF]/70"
              } ${pagesOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Collapsible Sub-menu */}
          {pagesOpen && !collapsed && (
            <div className="mt-1 ml-3.5 pl-2.5 border-l-2 border-[#8FAF9A]/30 space-y-0.5">
              {storePageLinks.map(([to, label, Icon]) => (
                <NavLink
                  key={to}
                  to={to}
                  title={label}
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center gap-2 px-2.5 py-2 rounded-lg !bg-[#F9F6EF] !text-[#26382E] !font-bold text-[12.5px] shadow-sm transition-all"
                      : "flex items-center gap-2 px-2.5 py-2 rounded-lg text-[#F9F6EF]/70 hover:text-[#F9F6EF] hover:bg-white/10 font-medium text-[12.5px] transition-all"
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={14}
                        className={isActive ? "!text-[#26382E] shrink-0" : "!text-[#F9F6EF]/55 shrink-0"}
                      />
                      <span className={`truncate ${isActive ? "!text-[#26382E] !font-bold" : ""}`}>
                        {label}
                      </span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#26382E] shrink-0" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* System Section */}
        <div className="pt-2 border-t border-[#3a5045]/60 space-y-0.5">
          {systemLinks.map((item) => renderLink(item, true))}
        </div>
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
