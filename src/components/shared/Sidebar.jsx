import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation, Link } from "react-router";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { baseApi } from "../../redux/api/baseApi";
import { ChevronDown, ChevronsLeft, FileText, LogOut, X } from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";
import { navGroups, storePageLinks, systemLinks } from "./navConfig";

// The signed-in admin, as stored at login; never a hard-coded identity.
export function readAdminUser() {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("lumihaus_admin_user") : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const ROLE_LABELS = { super_admin: "Super Admin", admin: "Admin" };

export function adminInitials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "AD";
}

export default function Sidebar({ mobileOpen = false, onClose }) {
  const adminUser = readAdminUser();
  const adminName = adminUser?.name || "Administrator";
  const adminRole = ROLE_LABELS[adminUser?.role] || "Admin";
  const { collapsed, setCollapsed, notify } = useAdminUI();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const isStorePageActive =
    location.pathname.startsWith("/pages") ||
    location.pathname === "/store-pages" ||
    location.pathname === "/banners";
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

  const renderLink = ([to, label, Icon]) => (
    <NavLink
      title={label}
      key={to}
      to={to}
      end={to === "/" || to === "/settings"}
      className={({ isActive }) => `sb-link${isActive ? " active" : ""}`}
    >
      <Icon size={18} strokeWidth={1.9} className="shrink-0" />
      <span className="sb-label">{label}</span>
    </NavLink>
  );

  return (
    <aside className={`sidebar sb${mobileOpen ? " is-open" : ""}`} aria-label="Admin navigation">
      {/* Brand */}
      <div className="sb-brand">
        <Link to="/" className="sb-brand-link" title="LumiHaus Admin Home">
          <img src="/favicon.png" alt="" className="sb-brand-mark" />
          <span className="sb-brand-text">
            <strong>LumiHaus</strong>
            <small>Admin Console</small>
          </span>
        </Link>
        <button className="sb-icon-btn sb-close" onClick={onClose} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="sb-nav">
        {navGroups.map((group) => (
          <div key={group.title} className="sb-group">
            <p className="sb-group-title">{group.title}</p>
            {group.links.map(renderLink)}
          </div>
        ))}

        {/* Store Pages Dropdown Accordion */}
        <div className="sb-group">
          <p className="sb-group-title">Storefront</p>
          <button
            type="button"
            onClick={() => {
              if (collapsed) setCollapsed(false);
              setPagesOpen((prev) => !prev);
            }}
            title={`Store Pages (${storePageLinks.length} pages)`}
            aria-expanded={pagesOpen}
            className={`sb-link w-full text-left${isStorePageActive ? " in-section" : ""}`}
          >
            <FileText size={18} strokeWidth={1.9} className="shrink-0" />
            <span className="sb-label flex-1">Store Pages</span>
            <span className="sb-count">{storePageLinks.length}</span>
            <ChevronDown size={15} className={`sb-chevron${pagesOpen ? " is-open" : ""}`} />
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

        <div className="sb-group">
          <p className="sb-group-title">System</p>
          {systemLinks.map(renderLink)}
        </div>
      </nav>

      {/* User footer */}
      <div className="sb-footer">
        <div className="sb-user">
          <span className="sb-avatar">{adminInitials(adminName)}</span>
          <div className="sb-user-text">
            <strong title={adminName}>{adminName}</strong>
            <small>{adminRole}</small>
          </div>
          <button onClick={handleLogout} title="Sign out of Console" aria-label="Sign out" className="sb-icon-btn sb-logout">
            <LogOut size={17} />
          </button>
        </div>
        <button
          className="sb-collapse"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronsLeft size={16} />
          <span className="sb-label">Collapse</span>
        </button>
      </div>
    </aside>
  );
}
