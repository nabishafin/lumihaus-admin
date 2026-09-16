import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import Sidebar from "../components/shared/Sidebar";
import Header from "../components/shared/Header";
import AdminAlerts from "../components/shared/AdminAlerts";
import { useAdminUI } from "../context/AdminUIContext";

export default function DashboardLayout() {
  const { collapsed } = useAdminUI();
  const navigate = useNavigate();

  useEffect(() => {
    const token =
      localStorage.getItem("lumihaus_admin_token") ||
      localStorage.getItem("admin_token") ||
      localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

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

