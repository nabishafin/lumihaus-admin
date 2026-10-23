import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation, Link } from "react-router";
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
  Megaphone,
  Moon,
  Sun,
  PackageSearch,
  Receipt,
  RefreshCw,
  Scale,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Users2,
  WalletCards,
} from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";

const mainLinks = [
  ["/", "Overview", LayoutDashboard],
  ["/orders", "Orders & bKash", ClipboardList],
  ["/users", "Users & Admins", Users2],
  ["/products", "German Products", ShoppingBag],
  ["/expenses", "Expenses & Costs", Receipt],
  ["/bundles", "Skincare Bundles", Sparkles],
  ["/categories-brands", "Categories & Brands", Boxes],
  ["/pre-orders", "Import Requests", PackageSearch],
  ["/german-ritual", "German Ritual Feed", Camera],
  ["/banners", "Campaign Banner", Megaphone],
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

// The signed-in admin, as stored at login; never a hard-coded identity.
function readAdminUser() {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("lumihaus_admin_user") : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const ROLE_LABELS = { super_admin: "Super Admin", admin: "Admin" };

export default function Sidebar() {
  const adminUser = readAdminUser();
  const adminName = adminUser?.name || "Administrator";
  const adminInitials = adminName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "AD";
  const adminRole = ROLE_LABELS[adminUser?.role] || "Admin";
  const { collapsed, setCollapsed, notify, dark, setDark } = useAdminUI();
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
    <NavLink title={label} key={to} to={to} end={isExact} className={({ isActive }) => `nav-link sb-link${isActive ? " active" : ""}`}>
      <Icon size={18} className="shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  );

  return (
    <aside className="sidebar sb">
      {/* Brand */}
      <div className="brand flex items-center justify-center w-full !px-0 !pt-0 !pb-5 -mt-1">
        <Link
          to="/"
          className="flex items-center justify-center w-full transition hover:opacity-90"
          title="LumiHaus Admin Home"
        >
          <img
            src={collapsed ? "/favicon.png" : "/logo.png"}
            alt="LumiHaus"
            className={`transition-all duration-200 object-contain ${
              collapsed ? "h-10 w-10 rounded-md" : "w-[160px] h-auto"
            }`}
          />
        </Link>
      </div>

      {/* Collapse toggle */}
      <button className="collapse-button" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
        <ChevronLeft size={17} />
      </button>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1 custom-scroll">
        {/* Main Operations */}
        <div className="space-y-0.5">
          {mainLinks.map((item) => renderLink(item, item[0] === "/"))}
        </div>

        {/* Store Pages Dropdown Accordion */}
        <div className="sb-divider">
          <button
            type="button"
            onClick={() => {
              if (collapsed) setCollapsed(false);
              setPagesOpen((prev) => !prev);
            }}
            title="Store Pages (7 pages)"
            className={`nav-link sb-link w-full text-left${isStorePageActive ? " in-section" : ""}`}
          >
            <FileText size={18} className="shrink-0" />
            <span className="truncate flex-1">Store Pages</span>
            <span className="sb-count">{storePageLinks.length}</span>
            <ChevronDown
              size={15}
              className={`shrink-0 transition-transform duration-200 ${pagesOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Collapsible Sub-menu */}
          {pagesOpen && !collapsed && (
            <div className="sb-sub">
              {storePageLinks.map(([to, label, Icon]) => (
                <NavLink
                  key={to}
                  to={to}
                  title={label}
                  className={({ isActive }) => `sb-sublink${isActive ? " active" : ""}`}
                >
                  <Icon size={14} className="shrink-0" />
                  <span className="truncate">{label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* System Section */}
        <div className="sb-divider space-y-0.5">
          {systemLinks.map((item) => renderLink(item, true))}
        </div>
      </nav>

      {/* User footer */}
      <div className="sidebar-user">
        <span className="avatar">{adminInitials}</span>
        <div className="min-w-0">
          <strong className="block truncate" title={adminName}>{adminName}</strong>
          <small className="block truncate">{adminRole}</small>
        </div>
        <button
          onClick={() => setDark(!dark)}
          title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle color mode"
          className="theme-toggle sb-icon-btn ml-auto"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button onClick={handleLogout} title="Sign out of Console" className="sb-icon-btn">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
