import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { ChevronRight, Menu, Moon, Sun } from "lucide-react";
import Sidebar, { adminInitials, readAdminUser } from "../components/shared/Sidebar";
import { findNavTrail } from "../components/shared/navConfig";
import { useAdminUI } from "../context/AdminUIContext";

import toast from "react-hot-toast";

export default function DashboardLayout() {
  const { collapsed, notify, dark, setDark } = useAdminUI();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token =
      localStorage.getItem("lumihaus_admin_token") ||
      localStorage.getItem("admin_token") ||
      localStorage.getItem("token");

    const userRaw = localStorage.getItem("lumihaus_admin_user");
    let user = null;
    try {
      user = userRaw ? JSON.parse(userRaw) : null;
    } catch {}

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // Customer tokens/roles cannot access admin screens
    if (user && user.role !== "admin" && user.role !== "super_admin") {
      toast.error("Access denied. Admin or super_admin role required.");
      localStorage.removeItem("lumihaus_admin_token");
      localStorage.removeItem("admin_token");
      localStorage.removeItem("token");
      localStorage.removeItem("lumihaus_admin_user");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Listen for 403 access denied without logging out
  useEffect(() => {
    const handleForbidden = (e) => {
      const msg = e.detail?.message || "Access denied. Action requires elevated admin privileges.";
      toast.error(msg);
      notify(msg, "warning");
    };

    window.addEventListener("lumihaus:admin:forbidden", handleForbidden);
    return () => window.removeEventListener("lumihaus:admin:forbidden", handleForbidden);
  }, [notify]);

  // Phone/tablet: the sidebar is a drawer; close it on every navigation and on Escape.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const trail = findNavTrail(location.pathname);
  const adminUser = readAdminUser();
  const adminName = adminUser?.name || "Administrator";

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      {mobileOpen && <div className="sb-backdrop" onClick={() => setMobileOpen(false)} aria-hidden="true" />}
      <div className="app-main">
        {/* Slim bar: where you are + quick actions. The page's own heading stays the title. */}
        <header className="topbar">
          <button className="topbar-btn topbar-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={19} />
          </button>
          <nav className="topbar-trail" aria-label="Breadcrumb">
            <span>{trail.section}</span>
            <ChevronRight size={14} />
            <strong>{trail.page}</strong>
          </nav>
          <div className="topbar-actions">
            <button
              onClick={() => setDark(!dark)}
              title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle color mode"
              className="topbar-btn"
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <span className="topbar-avatar" title={adminName}>{adminInitials(adminName)}</span>
          </div>
        </header>
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

