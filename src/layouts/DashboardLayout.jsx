import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import Sidebar from "../components/shared/Sidebar";
import Header from "../components/shared/Header";
import AdminAlerts from "../components/shared/AdminAlerts";
import { useAdminUI } from "../context/AdminUIContext";

import toast from "react-hot-toast";

export default function DashboardLayout() {
  const { collapsed, notify } = useAdminUI();
  const navigate = useNavigate();

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

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar />
      <div className="app-main">
        <Header />
        <AdminAlerts />
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

